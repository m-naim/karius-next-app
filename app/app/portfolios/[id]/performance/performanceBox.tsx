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
    ? chartTypes.filter((c) => c.id === 'CumulativePerformance') 
    : chartTypes

  const selectedChart = availableChartTypes.find((c) => c.id === chartType) || availableChartTypes[0]

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
      
      const masked = res.value && res.value.length === 0 && res.CumulativePerformance && res.CumulativePerformance.length > 0
      setIsMasked(masked)
      
      if (masked && chartType !== 'CumulativePerformance') {
        setChartType('CumulativePerformance')
      }

      setDates(formattedDates)
      setChartValues(res[chartType === 'value' && masked ? 'CumulativePerformance' : chartType] || [])

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
    onPeriodChange(newPeriod)
    const chart = availableChartTypes.find((c) => c.id === chartType)
    if (chart) {
      setChartType(chart.id)
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-3 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          <Tabs value={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0">
              {availableChartTypes.map((chart) => (
                <TabsTrigger
                  key={chart.id}
                  value={chart.id}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs transition-all duration-200 hover:bg-accent hover:text-foreground',
                    'data-[state=active]:border-primary/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold'
                  )}
                >
                  <chart.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{chart.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 rounded-full bg-muted/40 p-1 border border-border/60 overflow-x-auto max-w-full no-scrollbar">
              {Object.keys(periodsConvert).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-all shrink-0',
                    period === p
                      ? 'bg-background text-primary shadow-xs'
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
      </div>

      <div className="mt-4 px-2">
        <div className="relative h-[260px] sm:h-[450px]">
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
