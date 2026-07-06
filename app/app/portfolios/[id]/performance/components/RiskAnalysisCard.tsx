import React from 'react';
import type { RiskMetrics } from '@/hooks/useRiskMetrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RiskAnalysisCardProps {
  metrics: RiskMetrics | null;
  loading: boolean;
  period?: string;
}

export function RiskAnalysisCard({ metrics, loading, period }: RiskAnalysisCardProps) {
  const isEligiblePeriod = period === '1Y' || period === '3Y';

  if (!isEligiblePeriod) {
    return (
      <Card className="w-full backdrop-blur-md bg-background/80 border-border/50 text-foreground">
        <CardHeader>
          <CardTitle>Analyse de Risque</CardTitle>
          <CardDescription>Indicateurs de risque avancés calculés en local</CardDescription>
        </CardHeader>
        <CardContent className="h-32 flex flex-col items-center justify-center text-center p-6">
          <p className="text-sm text-muted-foreground max-w-lg">
            Veuillez sélectionner une période de <strong>1 An (1Y)</strong> ou <strong>3 Ans (3Y)</strong> ci-dessus dans le graphique pour lancer les calculs du Sharpe, Sortino et le Max Drawdown en arrière-plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full backdrop-blur-md bg-background/80 border-border/50 text-foreground">
        <CardHeader>
          <CardTitle>Analyse de Risque</CardTitle>
          <CardDescription>Indicateurs de risque avancés calculés en local</CardDescription>
        </CardHeader>
        <CardContent className="h-36 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Calcul en cours des métriques de risque en arrière-plan...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatPercent = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getDrawdownColors = (val: number) => {
    if (val > -0.1) return { text: 'text-green-500', bg: 'bg-green-500' };
    if (val > -0.2) return { text: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { text: 'text-red-500', bg: 'bg-red-500' };
  };

  const getSortinoColor = (val: number) => {
    if (val > 1) return 'text-green-500';
    if (val > 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Create a visual representation of the drawdown (progress bar inverted)
  const drawdownPercentage = Math.min(Math.abs(metrics.maxDrawdown * 100), 100);
  const drawdownColors = getDrawdownColors(metrics.maxDrawdown);

  return (
    <Card className="w-full backdrop-blur-md bg-background/80 border-border/50 text-foreground">
      <CardHeader>
        <CardTitle>Analyse de Risque</CardTitle>
        <CardDescription>Indicateurs de risque avancés calculés en local</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Ratio de Sortino</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${getSortinoColor(metrics.sortino)}`}>
                {formatNumber(metrics.sortino)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mesure le rendement ajusté au risque par rapport à la volatilité à la baisse. Plus il est élevé, mieux c'est.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Chute Maximale (Max Drawdown)</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${drawdownColors.text}`}>
                {formatPercent(metrics.maxDrawdown)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 mt-2 overflow-hidden flex">
              <div
                className={`h-2.5 rounded-full ${drawdownColors.bg}`}
                style={{ width: `${drawdownPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              La perte maximale observée entre le sommet et le creux de la valeur du portefeuille. Une valeur absolue plus faible est préférable.
            </p>
          </div>

          {metrics.calmar !== undefined && (
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Ratio de Calmar</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold">
                  {formatNumber(metrics.calmar)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mesure le rendement ajusté au risque par rapport à la perte maximale (max drawdown). Plus il est élevé, mieux c'est.
              </p>
            </div>
          )}
        </div>
        {metrics.benchmarks && Object.keys(metrics.benchmarks).length > 0 && (
          <div className="mt-8 border-t border-border/50 pt-6">
            <h3 className="text-lg font-bold tracking-tight mb-4 text-foreground">Comparaison avec les Benchmarks</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <th className="py-2">Indicateur</th>
                    <th className="py-2 text-right">Portefeuille</th>
                    {Object.keys(metrics.benchmarks).map((symbol) => (
                      <th key={symbol} className="py-2 text-right">{symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-medium text-muted-foreground">Ratio de Sharpe</td>
                    <td className="py-3 text-right font-bold">{formatNumber(metrics.sharpe)}</td>
                    {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                      <td key={symbol} className="py-3 text-right text-muted-foreground">{formatNumber(m.sharpe)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-medium text-muted-foreground">Ratio de Sortino</td>
                    <td className="py-3 text-right font-bold">{formatNumber(metrics.sortino)}</td>
                    {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                      <td key={symbol} className="py-3 text-right text-muted-foreground">{formatNumber(m.sortino)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-medium text-muted-foreground">Volatilité (Annualisée)</td>
                    <td className="py-3 text-right font-bold">{formatPercent(metrics.volatility)}</td>
                    {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                      <td key={symbol} className="py-3 text-right text-muted-foreground">{formatPercent(m.volatility)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-medium text-muted-foreground">Chute Maximale (Drawdown)</td>
                    <td className="py-3 text-right font-bold">{formatPercent(metrics.maxDrawdown)}</td>
                    {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                      <td key={symbol} className="py-3 text-right text-muted-foreground">{formatPercent(m.maxDrawdown)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 font-medium text-muted-foreground">Bêta (sensibilité)</td>
                    <td className="py-3 text-right font-bold text-primary">—</td>
                    {Object.entries(metrics.benchmarks).map(([symbol, m]) => (
                      <td key={symbol} className="py-3 text-right font-bold text-primary">{formatNumber(m.beta)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RiskAnalysisCard;
