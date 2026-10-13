import React, { useEffect, useState } from 'react'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { BarValue } from '@/components/molecules/charts/BarValue'
import { AreaValue } from '@/components/molecules/charts/AreaValue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPerformances } from '@/services/portfolioService'
import { LineChart, BarChart2, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import BenchmarkSelector from './components/BenchmarkSelector'

const periodsConvert: Record<string, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '3Y': 1095,
  YTD: 0,
}

const chartTypes = [
  {
    id: 'value',
    label: 'Valeur',
    description: 'Évolution de la valeur totale',
    icon: LineChart,
    type: 'line',
    unit: '€',
    defaultPeriod: '1M',
    primary: true,
    showBenchmarks: true,
  },
  {
    id: 'dailyGains',
    label: 'Variations',
    description: 'Gains et pertes jour après jour',
    icon: BarChart2,
    type: 'bar',
    unit: '€',
    defaultPeriod: '1W',
    colors: { positive: 'rgb(34, 197, 94)', negative: 'rgb(239, 68, 68)' },
  },
  {
    id: 'CumulativePerformance',
    label: 'Performance',
    description: 'Performance cumulée en %',
    icon: TrendingUp,
    type: 'line',
    unit: '%',
    defaultPeriod: 'YTD',
    showBenchmarks: true,
  },
  {
    id: 'cumulativeGains',
    label: 'Gains cumulés',
    description: 'Total des gains et pertes cumulés',
    icon: TrendingUp,
    type: 'area',
    unit: '€',
    defaultPeriod: '1Y',
  },
  {
    id: 'cashValue',
    label: 'Liquidités',
    description: 'Évolution du cash disponible',
    icon: Wallet,
    type: 'line',
    unit: '€',
    defaultPeriod: '3M',
  },
]

interface PerformanceBoxProps {
  id: string
  selectedBenchmarks: string[]
  onAddBenchmark: (benchmark: string) => void
  onRemoveBenchmark: (benchmark: string) => void
  period: string
  onPeriodChange: (period: string) => void
}

export default function PerformanceBox({
  id,
  selectedBenchmarks,
  onAddBenchmark,
  onRemoveBenchmark,
  period,
  onPeriodChange,
}: PerformanceBoxProps) {
  const [chartType, setChartType] = useState(chartTypes[0].id)
  const [dates, setDates] = useState<string[]>([])
  const [chartValues, setChartValues] = useState<number[]>([])
  const [benchValues, setBenchValues] = useState<{ [key: string]: number[] }>({})
  const [loading, setLoading] = useState(false)
  const [isMasked, setIsMasked] = useState(false)

  const availableChartTypes = isMasked
    ? chartTypes.filter((chart) => chart.id === 'CumulativePerformance')
    : chartTypes
  const selectedChart = availableChartTypes.find((chart) => chart.id === chartType) || availableChartTypes[0]

  const fetchData = async () => {
    try {
      setLoading(true)
      let days = periodsConvert[period]
      if (period === 'YTD') {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
      }

      const res = await getPerformances(id, selectedBenchmarks, days)
      const formattedDates = res.timestamp.map((timestamp) =>
        new Date(timestamp * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      )
      const masked = res.value && res.value.length === 0 && res.CumulativePerformance && res.CumulativePerformance.length > 0
      const nextChartType = masked ? 'CumulativePerformance' : chartType

      setIsMasked(masked)
      if (masked && chartType !== 'CumulativePerformance') setChartType('CumulativePerformance')
      setDates(formattedDates)
      setChartValues(res[nextChartType] || [])

      if (selectedChart?.showBenchmarks) {
        const benchmarkData: { [key: string]: number[] } = {}
        selectedBenchmarks.forEach((benchmark) => {
          if (res.benchmarks?.[benchmark]) benchmarkData[benchmark] = res.benchmarks[benchmark]
        })
        setBenchValues(benchmarkData)
      } else {
        setBenchValues({})
      }
    } catch (e) {
      console.error('error api', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id, period, selectedBenchmarks, chartType])

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="space-y-4 border-b border-border/60 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">Évolution</p>
            <CardTitle className="text-lg font-black tracking-tight">{selectedChart?.label}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{selectedChart?.description}</p>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
            <div className="flex min-w-0 max-w-full flex-1 items-center gap-0.5 overflow-x-auto rounded-lg border border-border/70 bg-muted/35 p-1 no-scrollbar sm:flex-none">
              {Object.keys(periodsConvert).map((periodOption) => (
                <button
                  key={periodOption}
                  onClick={() => onPeriodChange(periodOption)}
                  aria-pressed={period === periodOption}
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors',
                    period === periodOption
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                  )}
                >
                  {periodOption}
                </button>
              ))}
            </div>
            {selectedChart?.showBenchmarks && (
              <BenchmarkSelector
                selectedBenchmarks={selectedBenchmarks}
                onAddBenchmark={onAddBenchmark}
                onRemoveBenchmark={onRemoveBenchmark}
              />
            )}
          </div>
        </div>

        <Tabs value={chartType} onValueChange={setChartType} className="w-full">
          <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted/35 p-1 no-scrollbar">
            {availableChartTypes.map((chart) => (
              <TabsTrigger
                key={chart.id}
                value={chart.id}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all',
                  'hover:bg-background/80 hover:text-foreground',
                  'data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
                )}
              >
                <chart.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{chart.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-3 sm:p-5">
        {isMasked && (
          <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            Les montants du portefeuille sont masqués. La performance relative reste disponible.
          </div>
        )}

        <div className="relative h-[280px] sm:h-[390px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/10 text-sm text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
              Chargement des données...
            </div>
          ) : (
            <>
              {selectedChart?.type === 'bar' ? (
                <BarValue
                  data={{ labels: dates, datasets: [{ data: chartValues }] }}
                  unit={selectedChart?.unit || '€'}
                />
              ) : selectedChart?.type === 'area' ? (
                <AreaValue
                  data={{
                    labels: dates,
                    datasets: [{ data: chartValues, label: selectedChart?.label || '' }],
                  }}
                  unit={selectedChart?.unit || '€'}
                />
              ) : (
                <LineValue
                  data={{
                    labels: dates,
                    datasets: [
                      { label: selectedChart?.label || '', data: chartValues },
                      ...Object.entries(benchValues).map(([key, values], index) => ({
                        label: key,
                        data: values,
                        borderColor: `rgb(255, ${99 + index * 40}, 132)`,
                      })),
                    ],
                  }}
                  unit={selectedChart?.unit || '€'}
                />
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
