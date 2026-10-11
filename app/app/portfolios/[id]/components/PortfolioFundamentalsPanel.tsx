'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, BarChart3, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getFundamentalsPerformance } from '@/services/portfolioService'
import { cn } from '@/lib/utils'

type TrendPoint = {
  label: string
  fiscalDate: string
  priceDate?: string | null
  revenue?: number | null
  freeCashFlow?: number | null
  price?: number | null
  revenueGrowthPercent?: number | null
  freeCashFlowGrowthPercent?: number | null
  priceGrowthPercent?: number | null
}

type SecurityTrend = {
  symbol: string
  weightPercent?: number | null
  currentPrice?: number | null
  status: 'AVAILABLE' | 'NO_DATA' | string
  points: TrendPoint[]
}

type FundamentalsResponse = {
  securities: SecurityTrend[]
}

const compactFormatter = new Intl.NumberFormat('fr-FR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatValue = (value?: number | null) =>
  value == null || !Number.isFinite(value) ? '—' : compactFormatter.format(value)

const formatPercent = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)} %`
}

const growthTone = (value?: number | null) => {
  if (value == null || !Number.isFinite(value)) return 'text-muted-foreground'
  return value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
}

const positiveStart = (points: TrendPoint[], key: 'revenue' | 'freeCashFlow' | 'price') =>
  points.find((point) => {
    const value = point[key]
    return value != null && Number.isFinite(value) && value > 0
  })?.[key]

const normalize = (value: number | null | undefined, start: number | null | undefined) => {
  if (value == null || start == null || !Number.isFinite(value) || !Number.isFinite(start) || start <= 0 || value <= 0) {
    return null
  }
  return Math.round((value / start) * 1000) / 10
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function PortfolioFundamentalsPanel({ portfolioId }: { portfolioId: string }) {
  const [data, setData] = useState<FundamentalsResponse | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)

    getFundamentalsPerformance(portfolioId)
      .then((response: FundamentalsResponse) => {
        if (!active) return
        const securities = Array.isArray(response?.securities) ? response.securities : []
        setData({ ...response, securities })
        setSelectedSymbol((current) => current && securities.some((item) => item.symbol === current)
          ? current
          : securities[0]?.symbol || '')
      })
      .catch((requestError) => {
        console.error('Failed to fetch portfolio fundamentals:', requestError)
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [portfolioId])

  const securities = data?.securities || []
  const selectedSecurity = securities.find((item) => item.symbol === selectedSymbol) || securities[0]

  const summary = useMemo(() => {
    const withData = securities.filter((security) => security.points.length > 0)
    const latest = withData.map((security) => security.points[security.points.length - 1])
    return {
      total: securities.length,
      withData: withData.length,
      revenueGrowing: latest.filter((point) => (point.revenueGrowthPercent ?? 0) > 0).length,
      fcfGrowing: latest.filter((point) => (point.freeCashFlowGrowthPercent ?? 0) > 0).length,
    }
  }, [securities])

  const chartData = useMemo(() => {
    if (!selectedSecurity) return []
    const points = selectedSecurity.points
    const revenueStart = positiveStart(points, 'revenue')
    const freeCashFlowStart = positiveStart(points, 'freeCashFlow')
    const priceStart = positiveStart(points, 'price')

    return points.map((point) => ({
      label: point.label,
      Prix: normalize(point.price, priceStart),
      CA: normalize(point.revenue, revenueStart),
      FCF: normalize(point.freeCashFlow, freeCashFlowStart),
    }))
  }, [selectedSecurity])

  const hasFcfChart = chartData.some((point) => point.FCF != null)

  if (loading) return <LoadingState />

  if (error) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="flex items-start gap-3 p-5 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Analyse fondamentale indisponible</p>
            <p className="mt-1 text-muted-foreground">Le portefeuille reste disponible. Réessayez depuis cet onglet dans quelques instants.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (securities.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground/60" />
          <p className="font-semibold">Aucune position à analyser</p>
          <p className="max-w-md text-sm text-muted-foreground">Ajoutez une action au portefeuille pour comparer ses fondamentaux et son cours.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold tracking-tight">Fondamentaux vs prix</h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Évolution annuelle du chiffre d’affaires, du FCF et du cours. Les courbes sont indexées à 100 au premier exercice disponible.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Action</span>
          <Select value={selectedSecurity?.symbol || ''} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="h-8 w-[150px] text-xs font-semibold">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {securities.map((security) => (
                <SelectItem key={security.symbol} value={security.symbol} className="text-xs">
                  {security.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryItem label="Positions" value={`${summary.total}`} detail={`${summary.withData} avec historique`} />
        <SummaryItem label="CA en hausse" value={`${summary.revenueGrowing}/${summary.withData}`} tone="positive" />
        <SummaryItem label="FCF en hausse" value={`${summary.fcfGrowing}/${summary.withData}`} tone="positive" />
        <SummaryItem label="Action suivie" value={selectedSecurity?.symbol || '—'} detail={selectedSecurity?.status === 'NO_DATA' ? 'Données manquantes' : `${selectedSecurity?.points.length || 0} exercices`} />
      </div>

      {selectedSecurity && selectedSecurity.points.length > 0 ? (
        <>
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 bg-muted/20 p-3 sm:p-4">
              <div>
                <h3 className="text-sm font-bold">{selectedSecurity.symbol} — trajectoires normalisées</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">Une valeur supérieure à 100 indique une progression depuis le premier point comparable.</p>
              </div>
              <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Prix</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />CA</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />FCF</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={34} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? `${value.toFixed(1)} (base 100)` : '—'} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Prix" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="CA" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    {hasFcfChart && <Line type="monotone" dataKey="FCF" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {!hasFcfChart && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="h-3.5 w-3.5" /> Le FCF est négatif ou incomplet sur cette période : sa courbe indexée n’est pas affichée.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/20 p-3 sm:p-4">
              <h3 className="text-sm font-bold">Détail des variations</h3>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[700px] text-xs">
                <thead className="bg-muted/30 text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Exercice</th>
                    <th className="px-4 py-3 text-right font-semibold">CA</th>
                    <th className="px-4 py-3 text-right font-semibold">CA YoY</th>
                    <th className="px-4 py-3 text-right font-semibold">FCF</th>
                    <th className="px-4 py-3 text-right font-semibold">FCF YoY</th>
                    <th className="px-4 py-3 text-right font-semibold">Cours</th>
                    <th className="px-4 py-3 text-right font-semibold">Cours YoY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {selectedSecurity.points.map((point) => (
                    <tr key={point.fiscalDate} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">{point.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatValue(point.revenue)}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', growthTone(point.revenueGrowthPercent))}>{formatPercent(point.revenueGrowthPercent)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatValue(point.freeCashFlow)}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', growthTone(point.freeCashFlowGrowthPercent))}>{formatPercent(point.freeCashFlowGrowthPercent)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatValue(point.price)}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', growthTone(point.priceGrowthPercent))}>{formatPercent(point.priceGrowthPercent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" />Hausse : CA/FCF et cours progressent</span>
            <span className="inline-flex items-center gap-1.5"><TrendingDown className="h-3.5 w-3.5 text-rose-500" />Une variation négative signale une baisse par rapport à l’exercice précédent</span>
          </div>
        </>
      ) : (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <Info className="h-7 w-7 text-muted-foreground/60" />
            <p className="font-semibold">Données fondamentales indisponibles pour {selectedSecurity?.symbol}</p>
            <p className="max-w-md text-sm text-muted-foreground">Cette position reste visible dans le portefeuille, mais aucun historique annuel exploitable n’est encore disponible.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryItem({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail?: string
  tone?: 'positive'
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-lg font-bold tabular-nums', tone === 'positive' && 'text-emerald-600 dark:text-emerald-400')}>{value}</p>
      {detail && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</p>}
    </div>
  )
}
