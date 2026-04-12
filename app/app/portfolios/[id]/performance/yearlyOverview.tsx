import React, { useEffect, useState } from 'react'
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
    if (val > 0) return isBenchmark ? 'bg-green-500/10' : 'bg-green-500/20'
    if (val < 0) return isBenchmark ? 'bg-red-500/10' : 'bg-red-500/20'
    return ''
  }

  return loading ? (
    <Loader />
  ) : (
    <Card className="w-full overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="border-b bg-gray-50/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">
              Récapitulatif Historique
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance mensuelle et annuelle comparée
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[1000px]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="sticky left-0 z-20 w-[120px] bg-gray-50 px-4 py-3 font-semibold text-muted-foreground">
                    Année
                  </th>
                  {MONTHS.map((m) => (
                    <th
                      key={m.value}
                      className="w-[70px] px-2 py-3 text-center font-semibold text-muted-foreground"
                    >
                      {m.display}
                    </th>
                  ))}
                  <th className="w-[90px] bg-muted/50 px-4 py-3 text-right font-bold text-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {perf.map((yearPerf) => (
                  <React.Fragment key={yearPerf.year}>
                    {/* Ligne Portefeuille */}
                    <tr className="group transition-colors hover:bg-muted/20">
                      <td className="sticky left-0 z-10 border-r bg-background px-4 py-3 font-bold text-foreground group-hover:bg-gray-50">
                        {yearPerf.year}
                        <span className="ml-2 rounded bg-primary/10 px-1 text-[10px] font-medium uppercase tracking-tighter text-primary">
                          Portefeuille
                        </span>
                      </td>
                      {MONTHS.map((m) => {
                        const val = yearPerf.monthlyPerformance[m.value]
                        return (
                          <td
                            key={m.value}
                            className={cn(
                              'border-r border-gray-100/50 px-2 py-3 text-center last:border-r-0',
                              getHeatmapClass(val)
                            )}
                          >
                            {val ? (
                              <VariationContainer value={val} className="text-xs font-bold" />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="bg-primary/5 px-4 py-3 text-right font-black">
                        <VariationContainer value={yearPerf.performance} className="text-xs" />
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
                          className="group bg-muted/5 transition-colors hover:bg-muted/30"
                        >
                          <td className="sticky left-0 z-10 border-r bg-gray-50/50 px-4 py-2 text-[11px] font-medium italic text-muted-foreground group-hover:bg-gray-100">
                            <div className="w-full truncate">{benchLabel}</div>
                          </td>
                          {MONTHS.map((m) => {
                            const val = benchData?.monthlyPerformance[m.value]
                            return (
                              <td
                                key={m.value}
                                className={cn(
                                  'border-r border-gray-100/50 px-2 py-2 text-center opacity-80 last:border-r-0',
                                  getHeatmapClass(val, true)
                                )}
                              >
                                {val ? (
                                  <VariationContainer
                                    value={val}
                                    className="text-[10px] font-medium"
                                  />
                                ) : (
                                  <span className="text-muted-foreground/30">—</span>
                                )}
                              </td>
                            )
                          })}
                          <td className="bg-muted/20 px-4 py-2 text-right">
                            {benchData ? (
                              <VariationContainer
                                value={benchData.performance}
                                className="text-[10px] font-bold"
                              />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
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
