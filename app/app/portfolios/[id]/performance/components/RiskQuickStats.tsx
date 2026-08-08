import React from 'react';
import type { RiskMetrics } from '@/hooks/useRiskMetrics';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskQuickStatsProps {
  metrics: RiskMetrics | null;
  loading: boolean;
  period?: string;
  onRecalculate?: () => void;
  recalculating?: boolean;
}

export function RiskQuickStats({
  metrics,
  loading,
  period,
  onRecalculate,
  recalculating = false,
}: RiskQuickStatsProps) {
  const isEligiblePeriod = period === '1Y' || period === '3Y';

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

  const getSharpeColor = (val: number) => {
    if (val > 1) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (val > 0) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getMaxDrawdownColor = (val: number) => {
    if (val > -0.1) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (val > -0.2) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getVolatilityColor = (val: number) => {
    if (val < 0.1) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (val < 0.2) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  if (!isEligiblePeriod) {
    return (
      <div className="flex items-center justify-between gap-3 w-full p-2.5 sm:p-3 rounded-2xl bg-card border border-border/70 shadow-sm text-foreground">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-bold text-foreground">
            Période : {period}
          </span>
          <span className="hidden sm:inline">Ratios de risque (Sharpe / Drawdown) disponibles en mode 1Y / 3Y</span>
        </div>

        {onRecalculate && (
          <Button
            onClick={onRecalculate}
            disabled={recalculating}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 text-xs font-bold border-border/80 bg-muted/20 hover:bg-accent shrink-0 h-8 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Calcul...' : 'Recalculer'}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full p-2.5 sm:p-3 rounded-2xl bg-card border border-border/70 shadow-sm text-foreground">
      {/* 3 Metric Badges */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground font-medium">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span>Calcul des métriques de risque...</span>
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-3 gap-2 flex-1">
          <StatBadge
            label="Sharpe"
            value={formatNumber(metrics.sharpe)}
            colorClass={getSharpeColor(metrics.sharpe)}
          />
          <StatBadge
            label="Max Drawdown"
            value={formatPercent(metrics.maxDrawdown)}
            colorClass={getMaxDrawdownColor(metrics.maxDrawdown)}
          />
          <StatBadge
            label="Volatilité"
            value={formatPercent(metrics.volatility)}
            colorClass={getVolatilityColor(metrics.volatility)}
          />
        </div>
      ) : null}

      {/* Embedded Recalculate Button */}
      {onRecalculate && (
        <Button
          onClick={onRecalculate}
          disabled={recalculating}
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 text-xs font-bold border-border/80 bg-muted/20 hover:bg-accent shrink-0 h-auto py-2.5 px-3"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Calcul...' : 'Recalculer'}</span>
        </Button>
      )}
    </div>
  );
}

function StatBadge({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className={`flex flex-col justify-center items-center p-1.5 sm:p-2.5 rounded-xl border text-center ${colorClass}`}>
      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider opacity-80 truncate w-full">{label}</span>
      <span className="text-sm sm:text-lg font-black mt-0.5 tabular-nums">{value}</span>
    </div>
  );
}

export default RiskQuickStats;
