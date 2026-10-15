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
  price?: number | null
  revenue?: number | null
  freeCashFlow?: number | null
  revenuePerShare?: number | null
  freeCashFlowPerShare?: number | null
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
  baseCurrency?: string | null
  securities: SecurityTrend[]
}

type AggregatePoint = {
  label: string
  fiscalDate: string
  Cours?: number | null
  CAParAction?: number | null
  FCFParAction?: number | null
  couverture: number
}

type WeightedValue = { sum: number; weight: number }

type AggregateBucket = {
  label: string
  fiscalDate: string
  price: WeightedValue
  revenue: WeightedValue
  freeCashFlow: WeightedValue
  symbols: Set<string>
}

const formatMoney = (value?: number | null, currency = 'EUR') => {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  }).format(value)
}

const formatMoneyDelta = (value?: number | null, currency = 'EUR') => {
  if (value == null || !Number.isFinite(value)) return undefined
  return `Écart historique ${value >= 0 ? '+' : ''}${formatMoney(value, currency)}`
}

const addWeighted = (target: WeightedValue, value: number | null, weight: number) => {
  if (value == null || !Number.isFinite(value) || weight <= 0) return
  target.sum += value * weight
  target.weight += weight
}

const weightedContribution = (value: WeightedValue) =>
  value.weight > 0 ? value.sum : null

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-52 rounded-xl" />
    </div>
  )
}

export function PortfolioFundamentalsOverview({ portfolioId }: { portfolioId: string }) {
  const [data, setData] = useState<FundamentalsResponse | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [viewMode, setViewMode] = useState<'portfolio' | 'security'>('portfolio')
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

  const aggregateData = useMemo<AggregatePoint[]>(() => {
    const available = securities.length || 1
    const buckets = new Map<string, AggregateBucket>()

    securities.forEach((security) => {
      const weight = Number.isFinite(security.weightPercent) && (security.weightPercent || 0) > 0
        ? (security.weightPercent as number) / 100
        : 1 / available

      security.points.forEach((point) => {
        const key = point.fiscalDate || point.label
        const bucket = buckets.get(key) || {
          label: point.label,
          fiscalDate: point.fiscalDate,
          price: { sum: 0, weight: 0 },
          revenue: { sum: 0, weight: 0 },
          freeCashFlow: { sum: 0, weight: 0 },
          symbols: new Set<string>(),
        }
        const price = point.price != null && Number.isFinite(point.price) ? point.price : null
        const revenuePerShare = point.revenuePerShare != null && Number.isFinite(point.revenuePerShare)
          ? point.revenuePerShare
          : null
        const freeCashFlowPerShare = point.freeCashFlowPerShare != null && Number.isFinite(point.freeCashFlowPerShare)
          ? point.freeCashFlowPerShare
          : null

        if (price != null || revenuePerShare != null || freeCashFlowPerShare != null) bucket.symbols.add(security.symbol)
        addWeighted(bucket.price, price, weight)
        addWeighted(bucket.revenue, revenuePerShare, weight)
        addWeighted(bucket.freeCashFlow, freeCashFlowPerShare, weight)
        buckets.set(key, bucket)
      })
    })

    return Array.from(buckets.values())
      .sort((a, b) => a.fiscalDate.localeCompare(b.fiscalDate))
      .map((bucket) => ({
        label: bucket.label,
        fiscalDate: bucket.fiscalDate,
        Cours: weightedContribution(bucket.price),
        CAParAction: weightedContribution(bucket.revenue),
        FCFParAction: weightedContribution(bucket.freeCashFlow),
        couverture: bucket.symbols.size,
      }))
  }, [securities])

  const securityChartData = useMemo(() => {
    if (!selectedSecurity) return []

    return selectedSecurity.points.map((point) => ({
      label: point.label,
      fiscalDate: point.fiscalDate,
      Cours: point.price,
      CAParAction: point.revenuePerShare,
      FCFParAction: point.freeCashFlowPerShare,
      couverture: 1,
    }))
  }, [selectedSecurity])

  const chartData = viewMode === 'portfolio' ? aggregateData : securityChartData
  const currency = data?.baseCurrency || 'EUR'
  const hasFcfChart = chartData.some((point) => point.FCFParAction != null)
  const latestPoint = chartData[chartData.length - 1]
  const firstPoint = chartData[0]

  const formatChartMoney = (value: unknown) =>
    typeof value === 'number' ? formatMoney(value, currency) : '—'

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

  if (loading) return <LoadingState />

  if (error) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5">
        <CardContent className="flex items-start gap-3 p-5 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Analyse fondamentale indisponible</p>
            <p className="mt-1 text-muted-foreground">Le portefeuille reste disponible. Réessayez depuis cette page dans quelques instants.</p>
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
          <p className="max-w-md text-sm text-muted-foreground">Ajoutez une action au portefeuille pour comparer les fondamentaux et l’évolution des prix.</p>
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
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            Valeurs monétaires agrégées avec le poids actuel de chaque ligne : cours × poids, CA/action × poids et FCF/action × poids. Aucune base 100.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5" role="tablist" aria-label="Niveau d'analyse">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'portfolio'}
              onClick={() => setViewMode('portfolio')}
              className={cn('rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors', viewMode === 'portfolio' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              Portefeuille
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'security'}
              onClick={() => setViewMode('security')}
              className={cn('rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors', viewMode === 'security' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >
              Ligne
            </button>
          </div>
          {viewMode === 'security' && (
            <Select value={selectedSecurity?.symbol || ''} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="h-8 w-[145px] text-xs font-semibold">
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryItem label="Positions" value={String(summary.total)} detail={summary.withData + ' avec historique'} />
        <SummaryItem
          label={viewMode === 'portfolio' ? 'Cours pondéré' : 'Cours'}
          value={formatMoney(latestPoint?.Cours, currency)}
          detail={firstPoint ? formatMoneyDelta((latestPoint?.Cours ?? 0) - (firstPoint.Cours ?? 0), currency) : undefined}
        />
        <SummaryItem
          label={viewMode === 'portfolio' ? 'CA/action pondéré' : 'CA/action'}
          value={formatMoney(latestPoint?.CAParAction, currency)}
          detail={firstPoint ? formatMoneyDelta((latestPoint?.CAParAction ?? 0) - (firstPoint.CAParAction ?? 0), currency) : undefined}
          tone="positive"
        />
        <SummaryItem
          label={viewMode === 'portfolio' ? 'FCF/action pondéré' : 'FCF/action'}
          value={formatMoney(latestPoint?.FCFParAction, currency)}
          detail={firstPoint ? formatMoneyDelta((latestPoint?.FCFParAction ?? 0) - (firstPoint.FCFParAction ?? 0), currency) : undefined}
          tone="positive"
        />
        <SummaryItem label="Couverture" value={viewMode === 'portfolio' ? `${latestPoint?.couverture ?? 0}/${summary.total}` : '1/1'} detail={viewMode === 'portfolio' ? `${summary.revenueGrowing} CA et ${summary.fcfGrowing} FCF en hausse` : selectedSecurity?.symbol} />
      </div>

      {chartData.length > 0 ? (
        <>
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 bg-muted/20 p-3 sm:p-4">
              <div>
                <h3 className="text-sm font-bold">
                  {viewMode === 'portfolio' ? 'Valeurs monétaires pondérées du portefeuille' : (
                    <>{selectedSecurity?.symbol || 'Ligne'} — valeurs monétaires</>
                  )}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Devise affichée : {currency}. Les agrégats utilisent le poids actuel des positions.
                </p>
              </div>
              <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Cours</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />CA/action</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />FCF/action</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={54}
                      tickFormatter={(value) => formatMoney(value, currency)}
                    />
                    <Tooltip
                      formatter={(value) => formatChartMoney(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Cours" name="Cours pondéré" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="CAParAction" name="CA/action pondéré" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    {hasFcfChart && <Line type="monotone" dataKey="FCFParAction" name="FCF/action pondéré" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {!hasFcfChart && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="h-3.5 w-3.5" /> Le FCF/action est incomplet sur cette période : sa courbe n’est pas affichée.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/20 p-3 sm:p-4">
              <h3 className="text-sm font-bold">Détail des valeurs monétaires</h3>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[680px] text-xs">
                <thead className="bg-muted/30 text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Exercice</th>
                    <th className="px-4 py-3 text-right font-semibold">CA/action</th>
                    <th className="px-4 py-3 text-right font-semibold">FCF/action</th>
                    <th className="px-4 py-3 text-right font-semibold">Cours</th>
                    {viewMode === 'portfolio' && <th className="px-4 py-3 text-right font-semibold">Couverture</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {chartData.map((point) => (
                    <tr key={point.fiscalDate} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">{point.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(point.CAParAction, currency)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(point.FCFParAction, currency)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(point.Cours, currency)}</td>
                      {viewMode === 'portfolio' && <td className="px-4 py-3 text-right tabular-nums">{point.couverture}/{summary.total}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" />Chaque valeur = valeur par action × poids de la ligne</span>
            <span className="inline-flex items-center gap-1.5"><TrendingDown className="h-3.5 w-3.5 text-rose-500" />Les valeurs sont monétaires, pas indexées à 100</span>
          </div>
        </>
      ) : (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <Info className="h-7 w-7 text-muted-foreground/60" />
            <p className="font-semibold">Données fondamentales indisponibles</p>
            <p className="max-w-md text-sm text-muted-foreground">Les positions restent visibles, mais aucun historique annuel exploitable n’est disponible pour l’agrégation.</p>
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
