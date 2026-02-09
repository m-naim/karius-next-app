'use client'
import { useEffect, useState } from 'react'
import { getStockHistory } from '@/services/stock.service'
import { format } from 'date-fns'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { stringToColor } from '@/lib/colors'

// Define interfaces for data structures
interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
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

  useEffect(() => {
    setLoading(true)
    const symbolsToFetch = [symbol, ...selectedBenchmarks]
    const historyPromises = getStockHistory(symbolsToFetch, period)

    historyPromises
      .then((results: { [key: string]: StockHistoryItem[] }) => {
        // Normalize data to show percentage change
        const historyData = Object.entries(results).map(([seriesSymbol, history]) => {
          return {
            label: seriesSymbol === symbol ? 'Actif' : seriesSymbol, // Use 'Actif' for the main symbol
            data: history.map((item) => item.close),
          }
        })

        const normalizedDatasets = Object.entries(results)
          .map(([seriesSymbol, history], index) => {
            const firstValue = history[0]?.close

            // Return null for empty histories to filter them out later
            if (!firstValue || firstValue === 0) return null

            const normalizedData = history.map((item) => (item.close / firstValue) * 100 - 100)

            return {
              label: seriesSymbol, // Use 'Actif' for the main symbol
              data: normalizedData,
              borderColor: stringToColor(seriesSymbol),
            }
          })
          .filter(Boolean) as ChartData['datasets'] // Filter out nulls and assert type

        // Use the labels from the primary stock's history
        const labels = (Object.values(results)[0] || []).map((item: StockHistoryItem) => {
          const millisecondsPerDay = 24 * 60 * 60 * 1000
          const date = new Date(item.day * millisecondsPerDay)
          return format(date, 'dd/MM/yyyy')
        })

        setChartData({ labels, datasets: normalizedDatasets })

        console.log(chartData)
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
    <div>
      <div className="my-4 flex justify-center space-x-2">
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

      <div className="my-4 flex items-center justify-center space-x-4">
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

      <div className="h-[300px] w-full">
        {loading ? <div>Chargement...</div> : <LineValue data={chartData} unit="%" />}
      </div>
    </div>
  )
}
