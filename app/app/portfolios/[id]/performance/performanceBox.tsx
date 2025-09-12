import React, { useState, useEffect } from 'react'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { BarValue } from '@/components/molecules/charts/BarValue'
import { AreaValue } from '@/components/molecules/charts/AreaValue'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPerformances } from '@/services/portfolioService'
import { LineChart, BarChart2, TrendingUp, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export default function PerformanceBox({ id, selectedBenchmarks }: PerformanceBoxProps) {
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
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">{selectedChart?.label}</h2>
            <p className="text-sm text-gray-500">{selectedChart?.description}</p>
          </div>
        </div>

        <Tabs value={chartType} onValueChange={setChartType} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 bg-transparent p-0 sm:grid-cols-3 md:grid-cols-5">
            {chartTypes.map((chart) => (
              <TabsTrigger
                key={chart.id}
                value={chart.id}
                className={cn(
                  'relative flex items-center justify-start gap-2 border-b border-r bg-white last:border-r-0',
                  'h-full min-h-[3rem] flex-row px-3 py-2',
                  'sm:min-h-[3.5rem] md:min-h-[3.5rem] md:justify-center',
                  'transition-all duration-200 hover:bg-gray-50/80',
                  'data-[state=active]:bg-white data-[state=active]:font-medium',
                  'data-[state=active]:before:absolute data-[state=active]:before:left-0 data-[state=active]:before:h-full data-[state=active]:before:w-0.5 data-[state=active]:before:bg-primary md:data-[state=active]:before:left-0 md:data-[state=active]:before:top-0 md:data-[state=active]:before:h-0.5 md:data-[state=active]:before:w-full',
                  chart.primary ? 'font-medium' : 'font-normal'
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <chart.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 md:h-5 md:w-5',
                      'text-gray-500',
                      'data-[state=active]:text-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs leading-tight md:text-sm',
                      'text-gray-600 group-hover:text-gray-900',
                      'data-[state=active]:text-gray-900',
                      'line-clamp-2 md:line-clamp-1'
                    )}
                  >
                    {chart.label}
                  </span>
                </div>
                {chart.primary && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary md:-top-1 md:right-2 md:h-2 md:w-2" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="relative h-[300px] sm:h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-sm text-gray-500">Chargement des données...</div>
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
                        backgroundColor: chartValues.map((v) =>
                          v >= 0
                            ? selectedChart?.colors?.positive || '#22c55e'
                            : selectedChart?.colors?.negative || '#ef4444'
                        ),
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
      </CardContent>

      <CardFooter className="border-t bg-gray-50/50 p-0">
        <div className="flex items-center gap-1 rounded-lg border bg-white p-1">
          {Object.keys(periodsConvert).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={cn(
                'rounded px-2.5 py-1.5 text-sm transition-colors',
                period === p
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
