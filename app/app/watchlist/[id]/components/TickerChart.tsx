'use client'
import { useEffect, useState } from 'react'
import { getStockHistory } from '@/services/stock.service'
import { format } from 'date-fns'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { stringToColor } from '@/lib/colors'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FundamentalChart } from './FundamentalChart'
import { calculateCAGR, calculateR2 } from '@/lib/math'

// Define interfaces for data structures
interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
  }[]
}

interface StockHistoryItem {
  day: number
  close: number
}

// Available benchmarks for selection
const availableBenchmarks = [
  { symbol: '^FCHI', name: 'CAC 40' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
]

const periodes = [
  { value: '1w', label: '5J' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1A' },
  { value: '5y', label: '5A' },
]

export function TickerChart({ symbol }: { symbol: string }) {
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(true)
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [metrics, setMetrics] = useState<{
    cagr: number | null
    r2: number | null
    min: number | null
    max: number | null
  }>({
    cagr: null,
    r2: null,
    min: null,
    max: null,
  })

  useEffect(() => {
    setLoading(true)
    const symbolsToFetch = [symbol, ...selectedBenchmarks]
    const historyPromises = getStockHistory(symbolsToFetch, period)

    historyPromises
      .then((results: { [key: string]: StockHistoryItem[] }) => {
        // Normalize data to show percentage change
        const historyData = Object.entries(results).map(([seriesSymbol, history]) => {
          return {
            label: seriesSymbol,
            data: history.map((item) => item.close),
            borderColor: stringToColor(seriesSymbol),
          }
        })

        const normalizedDatasets = Object.entries(results)
          .map(([seriesSymbol, history]) => {
            const firstValue = history[0]?.close

            // Return null for empty histories to filter them out later
            if (!firstValue || firstValue === 0) return null

            const normalizedData = history.map((item) => (item.close / firstValue) * 100 - 100)

            return {
              label: seriesSymbol,
              data: normalizedData,
              borderColor: stringToColor(seriesSymbol),
            }
          })
          .filter(Boolean) as ChartData['datasets']

        // Use the labels from the primary stock's history
        const labels = (Object.values(results)[0] || []).map((item: StockHistoryItem) => {
          const millisecondsPerDay = 24 * 60 * 60 * 1000
          const date = new Date(item.day * millisecondsPerDay)
          return format(date, 'dd/MM/yyyy')
        })

        setChartData({
          labels,
          datasets: selectedBenchmarks.length > 0 ? normalizedDatasets : historyData,
        })

        // Calculate metrics for the primary symbol
        const primaryHistory = results[symbol]
        if (primaryHistory && primaryHistory.length > 1) {
          const first = primaryHistory[0]
          const last = primaryHistory[primaryHistory.length - 1]
          const daysDiff = last.day - first.day
          const years = daysDiff / 365.25

          const closes = primaryHistory.map((d) => d.close)
          const cagr = calculateCAGR(first.close, last.close, years)
          const r2 = calculateR2(closes)
          const min = Math.min(...closes)
          const max = Math.max(...closes)

          setMetrics({ cagr, r2, min, max })
        } else {
          setMetrics({ cagr: null, r2: null, min: null, max: null })
        }

        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch historical data:', error)
        setLoading(false)
      })
  }, [symbol, period, selectedBenchmarks])

  const handleBenchmarkChange = (benchmarkSymbol: string) => {
    setSelectedBenchmarks((prev) =>
      prev.includes(benchmarkSymbol)
        ? prev.filter((s) => s !== benchmarkSymbol)
        : [...prev, benchmarkSymbol]
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{symbol}</h2>
      </div>

      <Tabs defaultValue="technical" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="technical">Technique</TabsTrigger>
          <TabsTrigger value="fundamental">Fondamental</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-4">
          <div className="flex justify-center space-x-2">
            {periodes.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-3 py-1 text-sm ${
                  period === p.value ? 'bg-gray-200' : 'bg-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Label>Comparer avec :</Label>
            {availableBenchmarks.map((bench) => (
              <div key={bench.symbol} className="flex items-center space-x-2">
                <Checkbox
                  id={bench.symbol}
                  checked={selectedBenchmarks.includes(bench.symbol)}
                  onCheckedChange={() => handleBenchmarkChange(bench.symbol)}
                />
                <Label htmlFor={bench.symbol}>{bench.name}</Label>
              </div>
            ))}
          </div>

          <div className="h-[400px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center">Chargement...</div>
            ) : (
              <LineValue data={chartData} unit={selectedBenchmarks.length > 0 ? '%' : '€'} />
            )}
          </div>

          {!loading && metrics.cagr !== null && (
            <div className="flex justify-center space-x-8 rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  CAGR ({period})
                </span>
                <span
                  className={`text-lg font-bold ${
                    metrics.cagr > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metrics.cagr.toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  LIN. (R²)
                </span>
                <span className="text-lg font-bold">
                  {metrics.r2 !== null ? `${(metrics.r2 * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  MIN
                </span>
                <span className="text-lg font-bold">
                  {metrics.min !== null ? metrics.min.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                  MAX
                </span>
                <span className="text-lg font-bold">
                  {metrics.max !== null ? metrics.max.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fundamental">
          <FundamentalChart symbol={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
