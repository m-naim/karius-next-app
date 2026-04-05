'use client'

import React, { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { security } from '@/app/app/watchlist/[id]/data/security'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { BarChart3, Activity, Layers, Box, CalendarDays, TrendingUp, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalysisViewProps {
  securities: security[]
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
]

const PERIODS = [
  { value: '1d', label: '1J' },
  { value: '1w', label: '1S' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1A' },
  { value: 'ytd', label: 'YTD' },
]

export function AnalysisView({ securities, selectedPeriod, setSelectedPeriod }: AnalysisViewProps) {
  const [grouping, setGrouping] = useState<'sector' | 'industry'>('sector')

  const getPerf = (s: security) => {
    if (selectedPeriod === '1d') return s.regularMarketChangePercent || 0
    return s.variations?.[selectedPeriod] || 0
  }

  // --- Data Transformations ---

  const distributionData = useMemo(() => {
    const groups: Record<string, { count: number; performance: number }> = {}
    securities.forEach((s) => {
      const key = (grouping === 'sector' ? s.sector : s.industry) || 'Unknown'
      const perf = getPerf(s)
      if (!groups[key]) groups[key] = { count: 0, performance: 0 }
      groups[key].count += 1
      groups[key].performance += perf
    })
    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        value: data.count,
        avgPerformance: data.performance / data.count,
      }))
      .sort((a, b) => b.value - a.value)
  }, [securities, selectedPeriod, grouping])

  const capData = useMemo(() => {
    const caps = [
      { name: 'Mega', value: 0 },
      { name: 'Large', value: 0 },
      { name: 'Mid', value: 0 },
      { name: 'Small', value: 0 },
    ]
    securities.forEach((s) => {
      const mc = s.marketCap || 0
      if (mc >= 200000000000) caps[0].value++
      else if (mc >= 10000000000) caps[1].value++
      else if (mc >= 2000000000) caps[2].value++
      else caps[3].value++
    })
    return caps
  }, [securities])

  const performanceGroups = useMemo(() => {
    const groups = [
      { name: '>10%', value: 0, color: '#10b981' },
      { name: '5-10%', value: 0, color: '#34d399' },
      { name: '0-5%', value: 0, color: '#6ee7b7' },
      { name: '-5-0%', value: 0, color: '#f87171' },
      { name: '<-5%', value: 0, color: '#ef4444' },
    ]
    securities.forEach((s) => {
      const perf = getPerf(s)
      if (perf > 10) groups[0].value++
      else if (perf > 5) groups[1].value++
      else if (perf > 0) groups[2].value++
      else if (perf > -5) groups[3].value++
      else groups[4].value++
    })
    return groups
  }, [securities, selectedPeriod])

  const averages = useMemo(() => {
    const validPEs = securities.filter((s) => s.trailingPE && s.trailingPE > 0)
    const avgPE = validPEs.reduce((acc, s) => acc + s.trailingPE, 0) / (validPEs.length || 1)
    const avgYield =
      securities.reduce((acc, s) => acc + (s.dividendYield || 0), 0) / (securities.length || 1)
    const avgPerf = securities.reduce((acc, s) => acc + getPerf(s), 0) / (securities.length || 1)
    return { avgPE, avgYield, avgPerf }
  }, [securities, selectedPeriod])

  const sortedSecurities = useMemo(
    () => [...securities].sort((a, b) => getPerf(b) - getPerf(a)),
    [securities, selectedPeriod]
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Dynamic Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b bg-muted/10 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Période:</span>
            <span className="text-primary">
              {PERIODS.find((p) => p.value === selectedPeriod)?.label}
            </span>
          </div>

          <div className="hidden h-6 w-px bg-border md:block" />

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-md border border-border/50 bg-background/50 p-0.5">
              <Button
                variant={grouping === 'sector' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-[10px] font-bold"
                onClick={() => setGrouping('sector')}
              >
                Secteur
              </Button>
              <Button
                variant={grouping === 'industry' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-[10px] font-bold"
                onClick={() => setGrouping('industry')}
              >
                Industrie
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border border-border/50 bg-background/50 p-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={selectedPeriod === p.value ? 'default' : 'ghost'}
              className={`h-8 px-3 text-xs font-bold transition-all ${selectedPeriod === p.value ? 'shadow-sm' : ''}`}
              onClick={() => setSelectedPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto p-4 lg:p-6">
        {/* Top Stats - Responsive Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Performance Moy.',
              value: (
                <VariationContainer
                  value={averages.avgPerf}
                  entity="%"
                  background={false}
                  className="m-0 p-0 text-2xl font-black lg:text-3xl"
                />
              ),
              icon: Activity,
              color: 'text-blue-500',
            },
            {
              label: 'P/E Moyen',
              value: round10(averages.avgPE, -2),
              icon: BarChart3,
              color: 'text-purple-500',
            },
            {
              label: 'Rendement Moy.',
              value: `${round10(averages.avgYield, -2)}%`,
              icon: Layers,
              color: 'text-emerald-500',
            },
            {
              label: 'Total Valeurs',
              value: securities.length,
              icon: Box,
              color: 'text-orange-500',
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border-border/60 shadow-sm transition-colors hover:border-primary/30"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="font-black">{stat.value}</div>
                </div>
                <stat.icon className={`h-8 w-8 opacity-20 ${stat.color} hidden sm:block`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid - More Adaptive */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Group Analytics */}
          <Card className="border-border/60 shadow-sm xl:col-span-2">
            <CardHeader className="border-b bg-muted/5 p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
                <Layers className="h-4 w-4 text-primary" />
                Répartition et Performance par {grouping === 'sector' ? 'Secteur' : 'Industrie'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid min-h-[300px] grid-cols-1 gap-8 p-6 md:grid-cols-2">
              <div className="h-[250px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[250px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distributionData}
                    layout="vertical"
                    margin={{ left: 0, right: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#88888810"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={10}
                      width={120}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="avgPerformance" radius={[0, 4, 4, 0]} barSize={15}>
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.avgPerformance >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                    <RechartsTooltip
                      formatter={(v: number) => [`${round10(v, -2)}%`, 'Perf']}
                      cursor={{ fill: 'transparent' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Distributions & Tops */}
          <div className="flex flex-col gap-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/5 p-4">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase">
                  <Box className="h-4 w-4 text-primary" /> Capitalisation
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[180px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/5 p-4">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600">
                  <TrendingUp className="h-4 w-4" /> Top 5 Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {sortedSecurities.slice(0, 5).map((s, idx) => (
                    <div
                      key={s.symbol}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-[10px] font-bold text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <span className="text-sm font-bold">{s.symbol}</span>
                        <span className="hidden max-w-[100px] truncate text-[10px] text-muted-foreground sm:inline">
                          {s.longname}
                        </span>
                      </div>
                      <VariationContainer
                        value={getPerf(s)}
                        entity="%"
                        background={true}
                        className="text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="border-b bg-muted/5 p-4">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase text-red-600">
                  <TrendingUp className="h-4 w-4 rotate-180" /> Flop 5 Performances
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {sortedSecurities
                    .slice(-5)
                    .reverse()
                    .map((s, idx) => (
                      <div
                        key={s.symbol}
                        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-4 text-[10px] font-bold text-muted-foreground">
                            {idx + 1}.
                          </span>
                          <span className="text-sm font-bold">{s.symbol}</span>
                          <span className="hidden max-w-[100px] truncate text-[10px] text-muted-foreground sm:inline">
                            {s.longname}
                          </span>
                        </div>
                        <VariationContainer
                          value={getPerf(s)}
                          entity="%"
                          background={true}
                          className="text-xs font-bold"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
