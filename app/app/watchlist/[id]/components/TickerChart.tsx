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
import { calculateCAGR, calculateR2, calculateYearlyVariations } from '@/lib/math'
import MetricsDisplay, { TickerChartMetrics } from '@/components/molecules/MetricsDisplay'
import MultiSelectTagDropdown from '@/components/molecules/MultiSelectTagDropdown'
import { PerHistoryChart } from './PerHistoryChart'

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
  { value: '10y', label: '10A' },
]

export function TickerChart({
  symbol,
  tags = [],
  allAvailableTags = [],
  onTagsChange,
  onAddGlobalTag,
  onDeleteGlobalTag,
}: {
  symbol: string
  tags?: string[]
  allAvailableTags?: string[]
  onTagsChange?: (newTags: string[]) => void
  onAddGlobalTag?: (newTag: string) => void
  onDeleteGlobalTag?: (tag: string) => void
}) {
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(true)
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [metrics, setMetrics] = useState<TickerChartMetrics>({
    cagr: null,
    r2: null,
    min: null,
    max: null,
    allPeriodVariation: null,
    bestYearVariation: null,
    worstYearVariation: null,
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

          // Calculate allPeriodVariation
          const allPeriodVariation = ((last.close - first.close) / first.close) * 100

          // Placeholder for yearly variations (will implement these functions in lib/math.ts)
          const { bestYearVariation, worstYearVariation } =
            calculateYearlyVariations(primaryHistory)

          setMetrics({
            cagr,
            r2,
            min,
            max,
            allPeriodVariation,
            bestYearVariation,
            worstYearVariation,
          })
        } else {
          setMetrics({
            cagr: null,
            r2: null,
            min: null,
            max: null,
            allPeriodVariation: null,
            bestYearVariation: null,
            worstYearVariation: null,
          })
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
          <TabsTrigger value="valorisation">Valorisation</TabsTrigger>
          {onTagsChange && <TabsTrigger value="tags">Tags</TabsTrigger>}
        </TabsList>

        <TabsContent value="technical" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {periodes.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    period === p.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l pl-3">
              {availableBenchmarks.map((bench) => (
                <div key={bench.symbol} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={bench.symbol}
                    checked={selectedBenchmarks.includes(bench.symbol)}
                    onCheckedChange={() => handleBenchmarkChange(bench.symbol)}
                    className="h-3.5 w-3.5"
                  />
                  <Label htmlFor={bench.symbol} className="cursor-pointer text-xs font-medium">
                    {bench.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[250px] w-full rounded-lg border bg-card/30 p-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm">Chargement...</div>
            ) : (
              <LineValue data={chartData} unit={selectedBenchmarks.length > 0 ? '%' : '€'} />
            )}
          </div>

          <MetricsDisplay metrics={metrics} loading={loading} period={period} />
        </TabsContent>

        <TabsContent value="fundamental">
          <FundamentalChart symbol={symbol} />
        </TabsContent>

        <TabsContent value="valorisation">
          <PerHistoryChart symbol={symbol} />
        </TabsContent>

        {onTagsChange && (
          <TabsContent value="tags" className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Manage Tags</Label>
                <p className="text-xs text-muted-foreground">
                  Tags added here will be saved for {symbol} across this watchlist.
                </p>
              </div>
              <MultiSelectTagDropdown
                selectedTags={tags}
                allAvailableTags={allAvailableTags}
                onTagsChange={onTagsChange}
                onAddGlobalTag={onAddGlobalTag || (() => {})}
                onDeleteGlobalTag={onDeleteGlobalTag}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
