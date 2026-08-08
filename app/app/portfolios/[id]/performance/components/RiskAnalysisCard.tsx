import React from 'react';
import type { RiskMetrics } from '@/hooks/useRiskMetrics';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, ShieldAlert, TrendingUp } from 'lucide-react';

interface RiskAnalysisCardProps {
  metrics: RiskMetrics | null;
  loading: boolean;
  period?: string;
}

export function RiskAnalysisCard({ metrics, loading, period }: RiskAnalysisCardProps) {
  const isEligiblePeriod = period === '1Y' || period === '3Y';

  if (!isEligiblePeriod) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-full border-border/70 bg-card shadow-sm text-foreground">
        <CardContent className="h-28 flex flex-col items-center justify-center text-center p-4 space-y-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          <p className="text-xs text-muted-foreground">Calcul des métriques de risque...</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatPercent = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getDrawdownColors = (val: number) => {
    if (val > -0.1) return { text: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (val > -0.2) return { text: 'text-amber-500', bg: 'bg-amber-500' };
    return { text: 'text-rose-500', bg: 'bg-rose-500' };
  };

  const getSortinoColor = (val: number) => {
    if (val > 1) return 'text-emerald-500';
    if (val > 0) return 'text-amber-500';
    return 'text-rose-500';
  };

  const drawdownPercentage = Math.min(Math.abs(metrics.maxDrawdown * 100), 100);
  const drawdownColors = getDrawdownColors(metrics.maxDrawdown);

  return (
    <TooltipProvider>
      <Card className="w-full border-border/70 bg-card shadow-sm text-foreground">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span>Analyse de Risque</span>
            </CardTitle>
            <span className="text-[10px] font-bold text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              Période {period}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Sortino Ratio */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Sortino
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-primary cursor-pointer transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Mesure le rendement ajusté par rapport à la volatilité uniquement à la baisse. Plus il est élevé, plus le risque baissier est maîtrisé.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className={`text-2xl font-black tabular-nums ${getSortinoColor(metrics.sortino)}`}>
                {formatNumber(metrics.sortino)}
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Max Drawdown
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-primary cursor-pointer transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Perte maximale observée entre le point le plus haut et le point le plus bas du portefeuille sur la période.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className={`text-2xl font-black tabular-nums ${drawdownColors.text}`}>
                {formatPercent(metrics.maxDrawdown)}
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${drawdownColors.bg}`}
                  style={{ width: `${drawdownPercentage}%` }}
                />
              </div>
            </div>

            {/* Calmar Ratio (if present) */}
            {metrics.calmar !== undefined && (
              <div className="col-span-2 p-3 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">Ratio de Calmar</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-primary cursor-pointer transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Rapport entre le rendement annualisé et le Max Drawdown.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-base font-black tabular-nums text-foreground">
                  {formatNumber(metrics.calmar)}
                </span>
              </div>
            )}
          </div>

          {/* Benchmark comparison table */}
          {metrics.benchmarks && Object.keys(metrics.benchmarks).length > 0 && (
            <div className="border-t border-border/50 pt-3 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Comparaison vs Indices
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase font-bold">
                      <th className="py-1">Indicateur</th>
                      <th className="py-1 text-right">Pft</th>
                      {Object.keys(metrics.benchmarks).map((symbol) => (
                        <th key={symbol} className="py-1 text-right">{symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-xs">
                    <tr>
                      <td className="py-1.5 font-medium text-muted-foreground">Sharpe</td>
                      <td className="py-1.5 text-right font-bold">{formatNumber(metrics.sharpe)}</td>
                      {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                        <td key={symbol} className="py-1.5 text-right text-muted-foreground">{formatNumber(m.sharpe)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium text-muted-foreground">Drawdown</td>
                      <td className="py-1.5 text-right font-bold">{formatPercent(metrics.maxDrawdown)}</td>
                      {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                        <td key={symbol} className="py-1.5 text-right text-muted-foreground">{formatPercent(m.maxDrawdown)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium text-muted-foreground">Volatilité</td>
                      <td className="py-1.5 text-right font-bold">{formatPercent(metrics.volatility)}</td>
                      {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                        <td key={symbol} className="py-1.5 text-right text-muted-foreground">{formatPercent(m.volatility)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default RiskAnalysisCard;
