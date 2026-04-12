'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import {
  TrendingUp,
  Layers,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react'
import { stringToColor } from '@/lib/colors'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'

// Generic security interface to avoid strict dependency on watchlist data path
interface BaseSecurity {
  symbol: string
  sector?: string
  industry?: string
  regularMarketChangePercent?: number
  variations?: Record<string, number>
  [key: string]: any
}

interface AnalysisViewProps {
  securities: BaseSecurity[]
  selectedPeriod: string
  onPeriodChange?: (period: string) => void
}

type ViewType = 'assets' | 'sectors' | 'industries'
type SortType = 'perf' | 'weight'

const CORRELATION_METRICS = [
  { id: 'trailingPE', label: 'P/E Trail', unit: '', max: 100 },
  { id: 'forwardPE', label: 'P/E Fwd', unit: '', max: 100 },
  { id: 'marketCap', label: 'Cap', unit: 'B', divisor: 1000000000, max: Infinity },
  { id: 'dividendYield', label: 'Div %', unit: '%', divisor: 0.01, max: 20 },
  { id: 'priceToBook', label: 'P/B', unit: '', max: 20 },
  { id: 'beta', label: 'Beta', unit: '', max: 5 },
  { id: 'linearity10y', label: 'Linear', unit: '%', max: 100 },
  { id: 'score.profitability', label: 'Score Prof.', unit: '/10', max: 10 },
  { id: 'score.growth', label: 'Score Gr.', unit: '/10', max: 10 },
] as const

type CorrelationMetricId = (typeof CORRELATION_METRICS)[number]['id']

export function AnalysisView({ securities, selectedPeriod, onPeriodChange }: AnalysisViewProps) {
  const [view, setView] = useState<ViewType>('sectors')
  const [sort, setSort] = useState<SortType>('perf')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [correlMetric, setCorrelMetric] = useState<CorrelationMetricId>('trailingPE')

  const getPerf = (s: BaseSecurity, period: string) => {
    if (period === '1d') return s.regularMarketChangePercent || 0
    return s.variations?.[period] || 0
  }

  const allocationData = useMemo(() => {
    if (!securities || securities.length === 0) return []

    let result: any[] = []
    if (view === 'assets') {
      result = securities.map((s) => ({
        name: s.symbol,
        count: 1,
        weight: (1 / securities.length) * 100,
        avgPerformance: getPerf(s, selectedPeriod),
        items: [s],
      }))
    } else {
      const groups: Record<string, { count: number; performance: number; items: any[] }> = {}
      securities.forEach((s) => {
        const rawKey = view === 'sectors' ? s.sector : s.industry
        const key = rawKey && rawKey.trim() !== '' ? rawKey.trim() : 'Non classé'
        const perf = getPerf(s, selectedPeriod)
        if (!groups[key]) {
          groups[key] = { count: 0, performance: 0, items: [] }
        }
        groups[key].count += 1
        groups[key].performance += perf
        groups[key].items.push(s)
      })

      result = Object.entries(groups).map(([name, data]) => {
        const perfs = data.items.map((it) => getPerf(it, selectedPeriod))
        const mean = data.performance / data.count
        const stdDev = Math.sqrt(
          perfs.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.count
        )

        return {
          name,
          count: data.count,
          weight: (data.count / securities.length) * 100,
          avgPerformance: mean,
          min: Math.min(...perfs),
          max: Math.max(...perfs),
          stdDev,
          items: data.items.sort((a, b) => getPerf(b, selectedPeriod) - getPerf(a, selectedPeriod)),
        }
      })
    }

    return result.sort((a, b) => {
      if (sort === 'perf') return b.avgPerformance - a.avgPerformance
      return b.weight - a.weight
    })
  }, [securities, selectedPeriod, view, sort])

  const distributionData = useMemo(() => {
    const bins = [
      { range: '< -20%', min: -Infinity, max: -20 },
      { range: '-15%', min: -20, max: -15 },
      { range: '-10%', min: -15, max: -10 },
      { range: '-5%', min: -10, max: -5 },
      { range: '-2%', min: -5, max: -2 },
      { range: '0%', min: -2, max: 0 },
      { range: '+2%', min: 0, max: 2 },
      { range: '+5%', min: 2, max: 5 },
      { range: '+10%', min: 5, max: 10 },
      { range: '+15%', min: 10, max: 15 },
      { range: '+20%', min: 15, max: 20 },
      { range: '> +20%', min: 20, max: Infinity },
    ]

    const data = bins.map((bin) => ({
      ...bin,
      count: 0,
    }))

    securities.forEach((s) => {
      const perf = getPerf(s, selectedPeriod)
      const binIndex = bins.findIndex((b) => perf >= b.min && perf < b.max)
      if (binIndex !== -1) data[binIndex].count++
    })

    return data
  }, [securities, selectedPeriod])

  const correlationData = useMemo(() => {
    const metricConfig = CORRELATION_METRICS.find((m) => m.id === correlMetric)!
    return securities
      .filter((s) => {
        const val = correlMetric.includes('.')
          ? correlMetric.split('.').reduce((obj, key) => obj?.[key], s)
          : s[correlMetric]
        return (
          val !== undefined &&
          val !== null &&
          val > (metricConfig.id === 'beta' ? -5 : 0) &&
          val < (metricConfig.max || Infinity)
        )
      })
      .map((s) => {
        const rawVal = correlMetric.includes('.')
          ? correlMetric.split('.').reduce((obj, key) => obj?.[key], s)
          : s[correlMetric]
        const xVal = metricConfig.divisor ? rawVal / metricConfig.divisor : rawVal
        return {
          x: xVal,
          y: getPerf(s, selectedPeriod),
          z: 1,
          symbol: s.symbol,
          rawX: rawVal,
        }
      })
  }, [securities, selectedPeriod, correlMetric])

  const performanceGroups = useMemo(() => {
    const groups = [
      { name: '> 5%', value: 0, color: '#10b981', label: 'Excellent' }, // emerald-500
      { name: '0 à 5%', value: 0, color: '#34d399', label: 'Positif' }, // emerald-400
      { name: '-5 à 0%', value: 0, color: '#fb7185', label: 'Négatif' }, // rose-400
      { name: '< -5%', value: 0, color: '#e11d48', label: 'Critique' }, // rose-600
    ]
    securities.forEach((s) => {
      const perf = getPerf(s, selectedPeriod)
      if (perf > 5) groups[0].value++
      else if (perf > 0) groups[1].value++
      else if (perf > -5) groups[2].value++
      else groups[3].value++
    })
    return groups
  }, [securities, selectedPeriod])

  const stats = useMemo(() => {
    const avgPerf =
      securities.reduce((acc, s) => acc + getPerf(s, selectedPeriod), 0) / (securities.length || 1)
    const top3 = [...securities]
      .sort((a, b) => getPerf(b, selectedPeriod) - getPerf(a, selectedPeriod))
      .slice(0, 3)
    const bottom3 = [...securities]
      .sort((a, b) => getPerf(a, selectedPeriod) - getPerf(b, selectedPeriod))
      .slice(0, 3)
    return { avgPerf, top3, bottom3 }
  }, [securities, selectedPeriod])

  const periods = ['1d', '1w', '1m', '1y', '5y']

  return (
    <div className="scrollbar-hide flex h-full flex-col gap-6 overflow-y-auto bg-background/50 p-6">
      {/* 1. Ultra-Compact Top Bar */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-lg font-bold tracking-tight">Analyse Dynamique</h1>
          
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span>Perf:</span>
              <VariationContainer
                value={stats.avgPerf}
                entity="%"
                className="p-0 text-[11px] font-black"
                background={false}
              />
            </div>
            <span className="opacity-30">•</span>
            <div>
              <span>Actifs:</span> <span className="text-foreground font-black ml-0.5">{securities.length}</span>
            </div>
            <span className="opacity-30">•</span>
            <div>
              <span>Secteurs:</span> <span className="text-foreground font-black ml-0.5">{new Set(securities.map((s) => s.sector)).size}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={cn(
                'rounded px-2.5 py-1 text-[9px] font-black uppercase transition-all',
                selectedPeriod === p
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 3. Main Allocation List */}
        <Card className="border-none bg-background shadow-sm lg:col-span-8">
          <CardHeader className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                  <BarChart3 className="h-4 w-4 text-primary" /> Performance
                </CardTitle>
              </div>
              <div className="ml-4 flex items-center gap-1 border-l pl-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSort('perf')}
                  className={cn(
                    'h-7 px-2 text-[10px] font-bold uppercase',
                    sort === 'perf' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Tri Perf
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSort('weight')}
                  className={cn(
                    'h-7 px-2 text-[10px] font-bold uppercase',
                    sort === 'weight' ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Tri Poids
                </Button>
              </div>
            </div>
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as ViewType)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 sm:w-[240px]">
                <TabsTrigger value="assets" className="text-[9px] font-bold uppercase">
                  Actifs
                </TabsTrigger>
                <TabsTrigger value="sectors" className="text-[9px] font-bold uppercase">
                  Secteurs
                </TabsTrigger>
                <TabsTrigger value="industries" className="text-[9px] font-bold uppercase">
                  Métiers
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="scrollbar-hide max-h-[550px] divide-y overflow-y-auto">
              {allocationData.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedGroup(selectedGroup === item.name ? null : item.name)}
                  className={cn(
                    'flex cursor-pointer flex-col p-4 transition-colors hover:bg-muted/30',
                    selectedGroup === item.name ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-xs font-black text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: stringToColor(item.name) }}
                        />
                        <span className="truncate text-sm font-bold">{item.name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          ({item.count} val.)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full transition-all duration-700"
                            style={{
                              width: `${item.weight}%`,
                              backgroundColor: stringToColor(item.name),
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] font-bold text-muted-foreground">
                          {item.weight.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-black tabular-nums shadow-sm',
                          item.avgPerformance >= 0
                            ? 'border border-green-500/20 bg-green-500/10 text-green-600'
                            : 'border border-red-500/20 bg-red-500/10 text-red-600'
                        )}
                      >
                        {item.avgPerformance > 0 ? '+' : ''}
                        {item.avgPerformance.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Drill-down details */}
                  {selectedGroup === item.name && (
                    <div className="mt-4 space-y-4 border-t pt-4 animate-in fade-in zoom-in-95">
                      {/* Advanced Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-muted/20 p-2 text-center">
                          <p className="text-[9px] font-bold uppercase text-muted-foreground">
                            Min / Max
                          </p>
                          <p className="text-[10px] font-black tabular-nums">
                            {item.min.toFixed(1)}% / {item.max.toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/20 p-2 text-center">
                          <p className="text-[9px] font-bold uppercase text-muted-foreground">
                            Écart Type
                          </p>
                          <p className="text-[10px] font-black tabular-nums">
                            {item.stdDev.toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/20 p-2 text-center">
                          <p className="text-[9px] font-bold uppercase text-muted-foreground">
                            Linéarité
                          </p>
                          <p className="text-[10px] font-black tabular-nums">
                            {(100 / (1 + item.stdDev)).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      {/* Constituents List */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                        {item.items.map((security) => {
                          const p = getPerf(security, selectedPeriod)
                          return (
                            <div
                              key={security.symbol}
                              className="flex items-center justify-between rounded border border-border/40 bg-background/50 px-2 py-1 text-[10px]"
                            >
                              <span className="font-bold">{security.symbol}</span>
                              <span
                                className={cn(
                                  'font-black tabular-nums',
                                  p >= 0 ? 'text-green-600' : 'text-red-600'
                                )}
                              >
                                {p > 0 ? '+' : ''}
                                {p.toFixed(1)}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Distribution & Sentiment */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="border-none bg-background shadow-sm">
            <CardHeader className="border-b pb-2 text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-500" /> Sentiment ({selectedPeriod})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Performance Distribution Histogram */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="range" 
                      fontSize={8} 
                      fontWeight="bold"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis fontSize={8} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{data.range}</p>
                              <p className="text-xs font-black">{data.count} actifs</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x="0%" stroke="hsl(var(--foreground))" strokeDasharray="3 3" opacity={0.2} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.min >= 0 ? '#10b981' : '#e11d48'} 
                          fillOpacity={Math.abs(entry.min) > 10 ? 1 : 0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {performanceGroups.map((group, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-muted/20 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">
                        {group.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-black">{group.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-background shadow-sm">
            <CardHeader className="flex flex-col gap-2 border-b pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Target className="h-3 w-3 text-purple-500" /> Corrélation Marché
              </CardTitle>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex justify-center gap-1 pb-2">
                  {CORRELATION_METRICS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setCorrelMetric(m.id as CorrelationMetricId)}
                      className={cn(
                        'rounded px-2 py-0.5 text-[8px] font-bold uppercase transition-all',
                        correlMetric === m.id
                          ? 'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20'
                          : 'text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={CORRELATION_METRICS.find(m => m.id === correlMetric)?.label} 
                      unit={CORRELATION_METRICS.find(m => m.id === correlMetric)?.unit} 
                      fontSize={8} 
                      fontWeight="bold" 
                      axisLine={false} 
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Perf" 
                      unit="%" 
                      fontSize={8} 
                      fontWeight="bold" 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <ZAxis type="number" dataKey="z" range={[20, 20]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const metric = CORRELATION_METRICS.find(m => m.id === correlMetric)!;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-xs font-black">{data.symbol}</p>
                              <p className="text-[10px] font-bold text-muted-foreground">
                                {metric.label}: {data.x.toFixed(1)}{metric.unit}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground">Perf: {data.y.toFixed(1)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeDasharray="3 3" opacity={0.2} />
                    <Scatter name="Securities" data={correlationData}>
                      {correlationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.y >= 0 ? '#10b981' : '#e11d48'} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-[9px] font-medium text-muted-foreground italic">
                Axe X: {CORRELATION_METRICS.find(m => m.id === correlMetric)?.label} | Axe Y: Performance {selectedPeriod}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1 border-none bg-background shadow-sm">
            <CardHeader className="border-b pb-2">
              <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Extrêmes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase tracking-tighter text-green-600">
                  Meilleures hausses
                </div>
                {stats.top3.map((s) => (
                  <div
                    key={s.symbol}
                    className="flex items-center justify-between rounded-lg border-l-4 border-green-500 bg-green-50/30 p-2.5 text-xs shadow-sm"
                  >
                    <span className="font-black">{s.symbol}</span>
                    <VariationContainer
                      value={getPerf(s, selectedPeriod)}
                      entity="%"
                      className="p-0 font-black"
                      background={false}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase tracking-tighter text-red-600">
                  Plus fortes baisses
                </div>
                {stats.bottom3.map((s) => (
                  <div
                    key={s.symbol}
                    className="flex items-center justify-between rounded-lg border-l-4 border-red-500 bg-red-50/30 p-2.5 text-xs shadow-sm"
                  >
                    <span className="font-black">{s.symbol}</span>
                    <VariationContainer
                      value={getPerf(s, selectedPeriod)}
                      entity="%"
                      className="p-0 font-black"
                      background={false}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
