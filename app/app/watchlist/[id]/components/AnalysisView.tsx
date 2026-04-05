'use client'

import React, { useMemo } from 'react'
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
import { security } from '../data/security'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Layers,
  Box,
} from 'lucide-react'

interface AnalysisViewProps {
  securities: security[]
  selectedPeriod: string
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#8dd1e1',
]

export function AnalysisView({ securities, selectedPeriod }: AnalysisViewProps) {
  // Helper to match performance retrieval logic in columns.tsx
  const getPerf = (s: security) => {
    if (selectedPeriod === '1d') return s.regularMarketChangePercent || 0
    return s.variations?.[selectedPeriod] || 0
  }

  // --- Data Transformations ---

  // 1. Sector Distribution & Performance
  const sectorData = useMemo(() => {
    const sectors: Record<string, { count: number; performance: number }> = {}

    securities.forEach((s) => {
      const sector = s.sector || 'Unknown'
      const perf = getPerf(s)

      if (!sectors[sector]) {
        sectors[sector] = { count: 0, performance: 0 }
      }
      sectors[sector].count += 1
      sectors[sector].performance += perf
    })

    return Object.entries(sectors)
      .map(([name, data]) => ({
        name,
        value: data.count,
        avgPerformance: data.performance / data.count,
        label: `${name} (${data.count})`,
      }))
      .sort((a, b) => b.value - a.value)
  }, [securities, selectedPeriod])

  // 2. Capitalization Groups (Compact)
  const capData = useMemo(() => {
    const caps = [
      { name: 'Mega', value: 0, range: '>200B' },
      { name: 'Large', value: 0, range: '10B-200B' },
      { name: 'Mid', value: 0, range: '2B-10B' },
      { name: 'Small', value: 0, range: '<2B' },
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

  // 3. Performance Groups (Compact)
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

  // 4. Averages
  const averages = useMemo(() => {
    const validPEs = securities.filter((s) => s.trailingPE && s.trailingPE > 0)
    const avgPE = validPEs.reduce((acc, s) => acc + s.trailingPE, 0) / (validPEs.length || 1)
    const avgYield =
      securities.reduce((acc, s) => acc + (s.dividendYield || 0), 0) / (securities.length || 1)
    const avgPerf = securities.reduce((acc, s) => acc + getPerf(s), 0) / (securities.length || 1)
    return { avgPE, avgYield, avgPerf }
  }, [securities, selectedPeriod])

  return (
    <div className="scrollbar-hide flex h-full flex-col gap-3 overflow-y-auto bg-background/50 p-3">
      {/* Top Stats - Compact Row */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Card className="border-primary/10 bg-primary/5 shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Performance</p>
            <VariationContainer
              value={averages.avgPerf}
              entity="%"
              background={false}
              className="m-0 p-0 text-xl font-black"
            />
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">P/E Moyen</p>
            <p className="text-xl font-black">{round10(averages.avgPE, -2)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Rendement</p>
            <p className="text-xl font-black">{round10(averages.avgYield, -2)}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Valeurs</p>
            <p className="text-xl font-black">{securities.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Sector Analytics - Combined Card */}
        <Card className="border-border/50 shadow-none md:col-span-8">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="flex items-center gap-2 text-xs font-bold">
              <Layers className="h-3 w-3 text-primary" /> ANALYSE SECTORIELLE
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-3 pt-1 sm:grid-cols-2">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '4px', fontSize: '10px', padding: '4px' }}
                  />
                  <Legend iconSize={6} wrapperStyle={{ fontSize: '9px', bottom: -10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ left: -10, right: 20 }}>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    horizontal={true}
                    vertical={false}
                    stroke="#88888815"
                  />
                  <XAxis type="number" fontSize={9} tickFormatter={(v) => `${v}%`} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={9}
                    width={80}
                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                  />
                  <RechartsTooltip
                    formatter={(v: number) => [`${round10(v, -2)}%`, 'Perf']}
                    contentStyle={{ borderRadius: '4px', fontSize: '10px', padding: '4px' }}
                  />
                  <Bar dataKey="avgPerformance" radius={[0, 2, 2, 0]} barSize={12}>
                    {sectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.avgPerformance >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cap & Perf Distribution - Vertical Stack */}
        <div className="flex flex-col gap-3 md:col-span-4">
          <Card className="flex-1 border-border/50 shadow-none">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <Box className="h-3 w-3" /> CAPITALISATION
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[100px] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capData}>
                  <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="value" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={20} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: '10px' }}
                    cursor={{ fill: 'transparent' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex-1 border-border/50 shadow-none">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <BarChart3 className="h-3 w-3" /> PERFORMANCE
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[100px] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceGroups}>
                  <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={20}>
                    {performanceGroups.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <RechartsTooltip
                    contentStyle={{ fontSize: '10px' }}
                    cursor={{ fill: 'transparent' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Denser Metric Grid */}
      <Card className="border-border/50 shadow-none">
        <CardHeader className="border-b p-3 pb-1">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
            <Activity className="h-3 w-3" /> Top/Bottom Performances ({selectedPeriod})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-x divide-y sm:grid-cols-2 sm:divide-y-0">
            {/* Top 3 */}
            <div className="space-y-1 p-2">
              {[...securities]
                .sort((a, b) => getPerf(b) - getPerf(a))
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={s.symbol} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-3 text-muted-foreground">{idx + 1}.</span>
                      {s.symbol}
                    </span>
                    <VariationContainer
                      value={getPerf(s)}
                      entity="%"
                      background={false}
                      className="m-0 p-0 font-bold"
                    />
                  </div>
                ))}
            </div>
            {/* Bottom 3 */}
            <div className="space-y-1 p-2">
              {[...securities]
                .sort((a, b) => getPerf(a) - getPerf(b))
                .slice(0, 3)
                .map((s, idx) => (
                  <div key={s.symbol} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-3 text-muted-foreground">{idx + 1}.</span>
                      {s.symbol}
                    </span>
                    <VariationContainer
                      value={getPerf(s)}
                      entity="%"
                      background={false}
                      className="m-0 p-0 font-bold"
                    />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
