'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import {
  TrendingUp,
  Layers,
  Box,
  Target,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
} from 'lucide-react'
import { stringToColor } from '@/lib/colors'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

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

export function AnalysisView({ securities, selectedPeriod, onPeriodChange }: AnalysisViewProps) {
  const [view, setView] = useState<ViewType>('sectors')
  const [sort, setSort] = useState<SortType>('perf')

  const getPerf = (s: BaseSecurity, period: string) => {
    if (period === '1d') return s.regularMarketChangePercent || 0
    return s.variations?.[period] || 0
  }

  const allocationData = useMemo(() => {
    if (!securities || securities.length === 0) return []

    let result = []
    if (view === 'assets') {
      result = securities.map((s) => ({
        name: s.symbol,
        count: 1,
        weight: (1 / securities.length) * 100,
        avgPerformance: getPerf(s, selectedPeriod),
      }))
    } else {
      const groups: Record<string, { count: number; performance: number }> = {}
      securities.forEach((s) => {
        const rawKey = view === 'sectors' ? s.sector : s.industry
        const key = rawKey && rawKey.trim() !== '' ? rawKey.trim() : 'Non classé'
        const perf = getPerf(s, selectedPeriod)
        if (!groups[key]) {
          groups[key] = { count: 0, performance: 0 }
        }
        groups[key].count += 1
        groups[key].performance += perf
      })

      result = Object.entries(groups).map(([name, data]) => ({
        name,
        count: data.count,
        weight: (data.count / securities.length) * 100,
        avgPerformance: data.performance / data.count,
      }))
    }

    return result.sort((a, b) => {
      if (sort === 'perf') return b.avgPerformance - a.avgPerformance
      return b.weight - a.weight
    })
  }, [securities, selectedPeriod, view, sort])

  const performanceGroups = useMemo(() => {
    const groups = [
      { name: '> 5%', value: 0, color: 'hsl(var(--success))', label: 'Excellent' },
      { name: '0 à 5%', value: 0, color: 'hsl(var(--success)/0.6)', label: 'Positif' },
      { name: '-5 à 0%', value: 0, color: 'hsl(var(--destructive)/0.6)', label: 'Négatif' },
      { name: '< -5%', value: 0, color: 'hsl(var(--destructive))', label: 'Critique' },
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
      {/* 1. Top Bar: Title & Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Analyse Dynamique</h1>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {securities.length} Valeurs analysées
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={cn(
                'rounded px-3 py-1 text-[10px] font-bold uppercase transition-all',
                selectedPeriod === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Header Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: 'Perf. Moyenne',
            value: stats.avgPerf,
            type: 'variation',
            icon: TrendingUp,
            color: 'text-primary',
          },
          {
            label: 'Actifs',
            value: securities.length,
            type: 'number',
            icon: Target,
            color: 'text-blue-500',
          },
          {
            label: 'Secteurs',
            value: new Set(securities.map((s) => s.sector)).size,
            type: 'number',
            icon: Layers,
            color: 'text-purple-500',
          },
          {
            label: 'Vue active',
            value: selectedPeriod.toUpperCase(),
            type: 'text',
            icon: Zap,
            color: 'text-amber-500',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded-xl border border-border/40 bg-background p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <item.icon className={cn('h-3.5 w-3.5', item.color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {item.label}
              </span>
            </div>
            {item.type === 'variation' ? (
              <VariationContainer
                value={item.value as number}
                entity="%"
                className="p-0 text-2xl font-black"
                background={false}
              />
            ) : (
              <p className="text-2xl font-black">{item.value}</p>
            )}
          </div>
        ))}
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
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                >
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
            <CardContent className="p-6">
              <div className="mb-6 flex h-10 w-full overflow-hidden rounded-xl bg-muted/30">
                {performanceGroups.map((group, i) => {
                  const width = (group.value / securities.length) * 100
                  if (width === 0) return null
                  return (
                    <div
                      key={i}
                      className="flex h-full items-center justify-center text-[10px] font-black text-white transition-all"
                      style={{ width: `${width}%`, backgroundColor: group.color }}
                    >
                      {width > 12 && `${Math.round(width)}%`}
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2">
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
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        {group.label}
                      </span>
                    </div>
                    <span className="text-xs font-black">{group.value} val.</span>
                  </div>
                ))}
              </div>
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
