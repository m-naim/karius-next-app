import React from 'react'
import type { RiskMetrics } from '@/hooks/useRiskMetrics'
import { Button } from '@/components/ui/button'
import { RefreshCw, ShieldCheck } from 'lucide-react'

interface RiskQuickStatsProps {
  metrics: RiskMetrics | null
  loading: boolean
  period?: string
  onRecalculate?: () => void
  recalculating?: boolean
}

export function RiskQuickStats({
  metrics,
  loading,
  period,
  onRecalculate,
  recalculating = false,
}: RiskQuickStatsProps) {
  const isEligiblePeriod = period === '1Y' || period === '3Y'

  const formatPercent = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const getSharpeColor = (value: number) => {
    if (value > 1) return 'text-emerald-600 dark:text-emerald-400'
    if (value > 0) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getDrawdownColor = (value: number) =>
    value > -0.1
      ? 'text-emerald-600 dark:text-emerald-400'
      : value > -0.2
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'

  const getVolatilityColor = (value: number) =>
    value < 0.1
      ? 'text-emerald-600 dark:text-emerald-400'
      : value < 0.2
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'

  const action = onRecalculate ? (
    <Button
      onClick={onRecalculate}
      disabled={recalculating}
      variant="outline"
      size="sm"
      className="h-8 shrink-0 gap-1.5 rounded-lg border-border/70 bg-background px-3 text-xs font-bold"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
      <span>{recalculating ? 'Calcul...' : 'Actualiser'}</span>
    </Button>
  ) : null

  if (!isEligiblePeriod) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground">Indicateurs de risque</p>
            <p className="truncate text-xs text-muted-foreground">
              Disponibles sur les périodes 1 an et 3 ans · période active : {period}
            </p>
          </div>
        </div>
        {action}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-2 px-1 sm:w-36">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-black text-foreground">Risque</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{period}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-14 flex-1 items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          Calcul des indicateurs...
        </div>
      ) : metrics ? (
        <div className="grid flex-1 grid-cols-3 gap-2">
          <StatBadge label="Sharpe" value={formatNumber(metrics.sharpe)} colorClass={getSharpeColor(metrics.sharpe)} />
          <StatBadge label="Drawdown max" value={formatPercent(metrics.maxDrawdown)} colorClass={getDrawdownColor(metrics.maxDrawdown)} />
          <StatBadge label="Volatilité" value={formatPercent(metrics.volatility)} colorClass={getVolatilityColor(metrics.volatility)} />
        </div>
      ) : (
        <p className="flex-1 px-2 text-xs text-muted-foreground">Les indicateurs ne sont pas disponibles.</p>
      )}

      {action}
    </div>
  )
}

function StatBadge({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/60 bg-muted/20 px-2 py-2 text-center">
      <span className="block truncate text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className={`mt-0.5 block text-base font-black tabular-nums sm:text-lg ${colorClass}`}>{value}</span>
    </div>
  )
}

export default RiskQuickStats
