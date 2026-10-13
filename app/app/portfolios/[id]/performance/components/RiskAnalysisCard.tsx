import React from 'react'
import type { RiskMetrics } from '@/hooks/useRiskMetrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, ShieldAlert, TrendingUp } from 'lucide-react'

interface RiskAnalysisCardProps {
  metrics: RiskMetrics | null
  loading: boolean
  period?: string
}

export function RiskAnalysisCard({ metrics, loading, period }: RiskAnalysisCardProps) {
  const isEligiblePeriod = period === '1Y' || period === '3Y'

  if (!isEligiblePeriod) return null

  if (loading) {
    return (
      <Card className="w-full rounded-2xl border-border/70 bg-card shadow-sm">
        <CardContent className="flex h-52 flex-col items-center justify-center gap-3 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
          <p className="text-xs text-muted-foreground">Analyse du risque en cours...</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

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

  const getScoreColor = (value: number) => {
    if (value > 1) return 'text-emerald-600 dark:text-emerald-400'
    if (value > 0) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const drawdownPercentage = Math.min(Math.abs(metrics.maxDrawdown * 100), 100)
  const drawdownColor = metrics.maxDrawdown > -0.1
    ? 'bg-emerald-500'
    : metrics.maxDrawdown > -0.2
      ? 'bg-amber-500'
      : 'bg-rose-500'

  return (
    <TooltipProvider>
      <Card className="w-full rounded-2xl border-border/70 bg-card shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                Lecture du risque
              </CardTitle>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Deux indicateurs complémentaires pour lire la qualité de la performance.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
              {period}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <InsightTile
              label="Sortino"
              value={formatNumber(metrics.sortino)}
              color={getScoreColor(metrics.sortino)}
              description="Rendement ajusté du risque baissier."
            />
            <InsightTile
              label="Calmar"
              value={metrics.calmar !== undefined ? formatNumber(metrics.calmar) : '—'}
              color={metrics.calmar !== undefined ? getScoreColor(metrics.calmar) : 'text-muted-foreground'}
              description="Rendement annualisé rapporté au drawdown."
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Creux maximal</p>
                <p className="mt-1 text-xl font-black tabular-nums text-foreground">{formatPercent(metrics.maxDrawdown)}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-primary" aria-label="À propos du creux maximal">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Perte maximale observée entre un sommet et le point bas suivant sur la période.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div className={`h-full rounded-full ${drawdownColor}`} style={{ width: `${drawdownPercentage}%` }} />
            </div>
          </div>

          {metrics.benchmarks && Object.keys(metrics.benchmarks).length > 0 && (
            <div className="border-t border-border/60 pt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Comparaison aux indices
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[280px] border-collapse text-xs">
                  <thead className="bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-black">Indicateur</th>
                      <th className="px-3 py-2 text-right font-black">Pft</th>
                      {Object.keys(metrics.benchmarks).map((symbol) => (
                        <th key={symbol} className="px-3 py-2 text-right font-black">{symbol}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <ComparisonRow label="Sharpe" portfolio={formatNumber(metrics.sharpe)} benchmarks={Object.values(metrics.benchmarks).map((value) => formatNumber(value.sharpe))} />
                    <ComparisonRow label="Drawdown" portfolio={formatPercent(metrics.maxDrawdown)} benchmarks={Object.values(metrics.benchmarks).map((value) => formatPercent(value.maxDrawdown))} />
                    <ComparisonRow label="Volatilité" portfolio={formatPercent(metrics.volatility)} benchmarks={Object.values(metrics.benchmarks).map((value) => formatPercent(value.volatility))} />
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

function InsightTile({
  label,
  value,
  color,
  description,
}: {
  label: string
  value: string
  color: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="rounded-full text-muted-foreground hover:text-primary" aria-label={`À propos de ${label}`}>
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{description}</TooltipContent>
        </Tooltip>
      </div>
      <p className={`mt-1 text-xl font-black tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

function ComparisonRow({ label, portfolio, benchmarks }: { label: string; portfolio: string; benchmarks: string[] }) {
  return (
    <tr>
      <td className="px-3 py-2 font-medium text-muted-foreground">{label}</td>
      <td className="px-3 py-2 text-right font-black text-foreground">{portfolio}</td>
      {benchmarks.map((value, index) => (
        <td key={`${label}-${index}`} className="px-3 py-2 text-right text-muted-foreground">{value}</td>
      ))}
    </tr>
  )
}

export default RiskAnalysisCard
