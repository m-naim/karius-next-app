import React, { useState, useEffect } from 'react'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { BarValue } from '@/components/molecules/charts/BarValue'
import { AreaValue } from '@/components/molecules/charts/AreaValue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPerformances } from '@/services/portfolioService'
import { LineChart, BarChart2, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import BenchmarkSelector from './components/BenchmarkSelector'

const periodsConvert = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  '3Y': 1095,
  YTD: 0, // Sera calculé dynamiquement
}

const chartTypes = [
  {
    id: 'value',
    label: 'Valeur du portefeuille',
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
    label: 'Variations quotidiennes',
    description: '+/- par jour',
    icon: BarChart2,
    type: 'bar',
    unit: '€',
    defaultPeriod: '1W',
    colors: {
      positive: 'rgb(34, 197, 94)',
      negative: 'rgb(239, 68, 68)',
    },
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
    description: 'Total des gains/pertes',
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
}

export default function PerformanceBox({
  id,
  selectedBenchmarks,
  onAddBenchmark,
  onRemoveBenchmark,
}: PerformanceBoxProps) {
  const [chartType, setChartType] = useState(chartTypes[0].id)
  const [period, setPeriod] = useState(chartTypes[0].defaultPeriod)
  const [dates, setDates] = useState<string[]>([])
  const [chartValues, setChartValues] = useState<number[]>([])
  const [benchValues, setBenchValues] = useState<{ [key: string]: number[] }>({})
  const [loading, setLoading] = useState(false)

  const selectedChart = chartTypes.find((c) => c.id === chartType)

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
      const formattedDates = res.timestamp.map((t) =>
        new Date(t * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      )

      setDates(formattedDates)
      setChartValues(res[chartType])

      if (selectedChart?.showBenchmarks) {
        const benchmarkData = {}
        selectedBenchmarks.forEach((benchmark) => {
          if (res.benchmarks[benchmark]) {
            benchmarkData[benchmark] = res.benchmarks[benchmark]
          }
        })
        setBenchValues(benchmarkData)
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

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    const chart = chartTypes.find((c) => c.id === chartType)
    if (chart) {
      setChartType(chart.id)
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-6 pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{selectedChart?.label}</h2>
            <p className="text-sm text-muted-foreground">{selectedChart?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-2 flex items-center gap-1 rounded-full bg-muted/50 p-1">
              {Object.keys(periodsConvert).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[11px] font-bold uppercase transition-all',
                    period === p
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
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

        <Tabs value={chartType} onValueChange={setChartType} className="w-full px-2">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {chartTypes.map((chart) => (
              <TabsTrigger
                key={chart.id}
                value={chart.id}
                className={cn(
                  'relative flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-2 transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                  'data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none',
                  chart.primary ? 'font-medium' : 'font-normal'
                )}
              >
                <div className="flex items-center gap-2">
                  <chart.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      'text-muted-foreground',
                      'data-[state=active]:text-primary'
                    )}
                  />
                  <span className="text-sm">
                    {chart.label}
                  </span>
                </div>
                {chart.primary && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-2 ring-background">
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4 px-2">
        <div className="relative h-[400px] sm:h-[500px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-sm text-muted-foreground">Chargement des données...</div>
            </div>
          ) : (
            <>
              {selectedChart?.type === 'bar' ? (
                <BarValue
                  data={{
                    labels: dates,
                    datasets: [
                      {
                        data: chartValues,
                        // backgroundColor: chartValues.map((v) =>
                        //   v >= 0
                        //     ? selectedChart?.colors?.positive || '#22c55e'
                        //     : selectedChart?.colors?.negative || '#ef4444'
                        // ),
                      },
                    ],
                  }}
                  unit={selectedChart?.unit || '€'}
                />
              ) : selectedChart?.type === 'area' ? (
                <AreaValue
                  data={{
                    labels: dates,
                    datasets: [
                      {
                        data: chartValues,
                        label: selectedChart?.label || '',
                      },
                    ],
                  }}
                  unit={selectedChart?.unit || '€'}
                />
              ) : (
                <LineValue
                  data={{
                    labels: dates,
                    datasets: [
                      {
                        label: selectedChart?.label || '',
                        data: chartValues,
                      },
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
      </div>
    </div>
  )
}
