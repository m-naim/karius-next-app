import React, { useEffect, useState, useMemo } from 'react'
import Loader from '@/components/molecules/loader/loader'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getPerformancesSummary,
  getBenchmarksPerformanceSummary,
} from '@/services/portfolioService'
import { benchmarkOptions } from './components/BenchmarkSelector'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const MONTHS = [
  { value: 'January', display: 'Jan' },
  { value: 'February', display: 'Fév' },
  { value: 'March', display: 'Mar' },
  { value: 'April', display: 'Avr' },
  { value: 'May', display: 'Mai' },
  { value: 'June', display: 'Juin' },
  { value: 'July', display: 'Juil' },
  { value: 'August', display: 'Août' },
  { value: 'September', display: 'Sep' },
  { value: 'October', display: 'Oct' },
  { value: 'November', display: 'Nov' },
  { value: 'December', display: 'Déc' },
]

interface PerformanceSummary {
  idPortfolio: string
  year: number
  performance: number
  monthlyPerformance: { [key: string]: number }
}

interface YearlyOverviewProps {
  id: string
  selectedBenchmarks: string[]
}

export default function YearlyOverview({ id, selectedBenchmarks }: YearlyOverviewProps) {
  const [perf, setPerf] = useState<PerformanceSummary[]>([])
  const [benchmarksPerf, setBenchmarksPerf] = useState<{ [key: string]: PerformanceSummary[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await getPerformancesSummary(id as string)).sort((a, b) => b.year - a.year)
        setPerf(data)
        setLoading(false)
      } catch (e) {
        console.error('error api', e)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const data = await getBenchmarksPerformanceSummary(selectedBenchmarks)
        setBenchmarksPerf(data)
      } catch (e) {
        console.error('error api benchmarks', e)
      }
    }
    if (selectedBenchmarks.length > 0) {
      fetchBenchmarks()
    } else {
      setBenchmarksPerf({})
    }
  }, [selectedBenchmarks])

  const getHeatmapClass = (val: number, isBenchmark = false) => {
    if (!val) return ''
    if (val > 0) return isBenchmark ? 'bg-green-500/10' : 'bg-green-500/20 ring-1 ring-inset ring-green-500/30'
    if (val < 0) return isBenchmark ? 'bg-red-500/10' : 'bg-red-500/20 ring-1 ring-inset ring-red-500/30'
    return ''
  }

  const stats = useMemo(() => {
    let bestMonth = { val: -Infinity, month: '', year: 0 }
    let worstMonth = { val: Infinity, month: '', year: 0 }
    let totalMonths = 0
    let positiveMonths = 0

    perf.forEach(yearData => {
      Object.entries(yearData.monthlyPerformance).forEach(([m, val]) => {
        if (val !== null && val !== undefined && val !== 0) {
          totalMonths++
          if (val > 0) positiveMonths++
          if (val > bestMonth.val) bestMonth = { val, month: m, year: yearData.year }
          if (val < worstMonth.val) worstMonth = { val, month: m, year: yearData.year }
        }
      })
    })

    const winRate = totalMonths > 0 ? (positiveMonths / totalMonths) * 100 : 0
    
    // Map English month keys to short French display names
    const getMonthDisplay = (mValue: string) => {
      return MONTHS.find(m => m.value === mValue)?.display || mValue
    }

    return {
      bestMonth: bestMonth.val !== -Infinity ? { ...bestMonth, displayMonth: getMonthDisplay(bestMonth.month) } : null,
      worstMonth: worstMonth.val !== Infinity ? { ...worstMonth, displayMonth: getMonthDisplay(worstMonth.month) } : null,
      winRate: Math.round(winRate)
    }
  }, [perf])

  return loading ? (
    <Loader />
  ) : (
    <Card className="w-full overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">
              Récapitulatif Historique
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance mensuelle et annuelle comparée
            </p>
          </div>
          
          {/* Quick Stats */}
          {stats.bestMonth && stats.worstMonth && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Meilleur Mois</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <VariationContainer background={false} value={stats.bestMonth.val} />
                  <span className="text-xs text-muted-foreground font-normal">({stats.bestMonth.displayMonth} {stats.bestMonth.year})</span>
                </div>
              </div>
              <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
              <div className="flex flex-col items-end sm:items-start">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Pire Mois</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <VariationContainer background={false} value={stats.worstMonth.val} />
                  <span className="text-xs text-muted-foreground font-normal">({stats.worstMonth.displayMonth} {stats.worstMonth.year})</span>
                </div>
              </div>
              <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
              <div className="flex flex-col items-end sm:items-start">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Win Rate</span>
                <div className="font-bold text-foreground">
                  {stats.winRate}% <span className="text-xs font-normal text-muted-foreground">(dans le vert)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[1000px] p-2">
            <table className="w-full border-collapse text-left text-sm" style={{ borderSpacing: '4px', borderCollapse: 'separate' }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-[120px] bg-card px-4 py-2 font-semibold text-muted-foreground">
                    Année
                  </th>
                  {MONTHS.map((m) => (
                    <th
                      key={m.value}
                      className="w-[70px] px-1 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {m.display}
                    </th>
                  ))}
                  <th className="w-[90px] px-4 py-2 text-right font-bold text-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {perf.map((yearPerf) => (
                  <React.Fragment key={yearPerf.year}>
                    {/* Ligne Portefeuille */}
                    <tr className="group">
                      <td className="sticky left-0 z-10 bg-card px-4 py-2 font-bold text-foreground transition-colors group-hover:bg-muted/50 rounded-l-lg">
                        <div className="flex flex-col">
                          <span>{yearPerf.year}</span>
                          <span className="text-[10px] font-medium uppercase tracking-tighter text-primary/70">
                            Portefeuille
                          </span>
                        </div>
                      </td>
                      {MONTHS.map((m) => {
                        const val = yearPerf.monthlyPerformance[m.value]
                        return (
                          <td
                            key={m.value}
                            className="p-1"
                          >
                            <div className={cn(
                              'flex h-10 w-full flex-col items-center justify-center rounded-md transition-colors',
                              getHeatmapClass(val)
                            )}>
                              {val ? (
                                <VariationContainer background={false} value={val} className="text-xs font-bold" />
                              ) : (
                                <span className="text-muted-foreground/30">—</span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-4 py-2 text-right font-black">
                        <div className="flex h-10 items-center justify-end rounded-md bg-primary/5 px-3">
                          <VariationContainer background={false} value={yearPerf.performance} className="text-sm" />
                        </div>
                      </td>
                    </tr>

                    {/* Lignes Benchmarks pour cette année */}
                    {selectedBenchmarks.map((bench) => {
                      const benchData = benchmarksPerf[bench]?.find((p) => p.year === yearPerf.year)
                      const benchLabel =
                        benchmarkOptions.find((o) => o.value === bench)?.label || bench
                      return (
                        <tr
                          key={bench}
                          className="group"
                        >
                          <td className="sticky left-0 z-10 bg-card px-4 py-1.5 text-[11px] font-medium italic text-muted-foreground transition-colors group-hover:bg-muted/50 rounded-l-lg">
                            <div className="w-[100px] truncate">{benchLabel}</div>
                          </td>
                          {MONTHS.map((m) => {
                            const val = benchData?.monthlyPerformance[m.value] || 0
                            return (
                              <td
                                key={m.value}
                                className="p-1"
                              >
                                <div className={cn(
                                  'flex h-8 w-full items-center justify-center rounded border border-transparent opacity-80',
                                  getHeatmapClass(val, true)
                                )}>
                                  {val ? (
                                    <VariationContainer
                                      background={false}
                                      value={val}
                                      className="text-[10px] font-medium"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground/20 text-[10px]">—</span>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                          <td className="px-4 py-1.5 text-right">
                             <div className="flex h-8 items-center justify-end rounded bg-muted/20 px-2">
                              {benchData ? (
                                <VariationContainer
                                  background={false}
                                  value={benchData.performance}
                                  className="text-[11px] font-bold"
                                />
                              ) : (
                                <span className="text-muted-foreground/30">—</span>
                              )}
                             </div>
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
