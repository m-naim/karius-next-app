'use client'
import { useEffect, useState } from 'react'
import { getFundamentals, getStockHistory } from '@/services/stock.service'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { format } from 'date-fns'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

type ValuationMetric = 'pe' | 'ps'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
}

const periods = [
  { value: '1y', label: '1A' },
  { value: '5y', label: '5A' },
  { value: '10y', label: '10A' },
  { value: 'max', label: 'MAX' },
]

export function PerHistoryChart({ symbol }: { symbol: string }) {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('5y')
  const [isLogarithmic, setIsLogarithmic] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0])
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0])
  const [fullHistory, setFullHistory] = useState<any[]>([])
  const [fundamentals, setFundamentals] = useState<any>(null)
  const [metric, setMetric] = useState<ValuationMetric>('pe')

  useEffect(() => {
    setLoading(true)
    Promise.all([getStockHistory([symbol], period), getFundamentals(symbol)])
      .then(([historyRes, fundamentalsRes]) => {
        const history = historyRes[symbol] || []
        setFullHistory(history)
        setFundamentals(fundamentalsRes)

        if (period === 'max' && history.length > 0) {
          const years = history.map((p) => new Date(p.day * 24 * 60 * 60 * 1000).getFullYear())
          const minYear = Math.min(...years)
          const maxYear = Math.max(...years)
          setYearRange([minYear, maxYear])
          setSelectedRange([minYear, maxYear])
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch valuation history data:', err)
        setLoading(false)
      })
  }, [symbol, period])

  useEffect(() => {
    if (!fullHistory.length || !fundamentals) return

    let filteredHistory = fullHistory
    if (period === 'max' && selectedRange[0] !== 0) {
      const minTs = new Date(selectedRange[0], 0, 1).getTime() / (24 * 60 * 60 * 1000)
      const maxTs = new Date(selectedRange[1], 11, 31).getTime() / (24 * 60 * 60 * 1000)
      filteredHistory = fullHistory.filter((p) => p.day >= minTs && p.day <= maxTs)
    }

    const quarterly = [...(fundamentals.quarterly || [])].sort(
      (a, b) => new Date(a.fiscalDate).getTime() - new Date(b.fiscalDate).getTime()
    )

    const labels: string[] = []
    const data: number[] = []

    // Adjust downsampling based on period
    let sampleRate = 1
    if (period === '1y') sampleRate = 1
    else if (period === '5y') sampleRate = 3
    else sampleRate = 5

    filteredHistory.forEach((item, index) => {
      // Downsample data based on period to keep chart responsive
      if (index % sampleRate !== 0 && index !== filteredHistory.length - 1) return

      const itemDate = new Date(item.day * 24 * 60 * 60 * 1000)

      // Find the last 4 quarters prior to this date
      const priorQuarters = quarterly.filter(
        (q) => new Date(q.fiscalDate).getTime() <= itemDate.getTime()
      )

      const last4 = priorQuarters.slice(-4)
      if (last4.length !== 4) return

      let valuation: number | null = null
      if (metric === 'pe') {
        const ttmEps = last4.every((q) => q.eps != null)
          ? last4.reduce((sum, q) => sum + Number(q.eps), 0)
          : 0
        if (ttmEps > 0) valuation = item.close / ttmEps
      } else {
        const ttmRevenue = last4.every((q) => q.totalRevenue != null)
          ? last4.reduce((sum, q) => sum + Number(q.totalRevenue), 0)
          : 0
        const latestShares = [...last4]
          .reverse()
          .find((q) => Number(q.sharesOutstanding) > 0)?.sharesOutstanding
        const revenuePerShare = latestShares && ttmRevenue > 0
          ? ttmRevenue / Number(latestShares)
          : 0
        if (revenuePerShare > 0) valuation = item.close / revenuePerShare
      }

      if (valuation != null && Number.isFinite(valuation)) {
        labels.push(format(itemDate, 'dd/MM/yyyy'))
        data.push(valuation)
      }
    })

    setChartData({
      labels,
      datasets: [
        {
          label: metric === 'pe' ? 'PER (TTM)' : 'P/S (TTM)',
          data,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
        },
      ],
    })
  }, [fullHistory, fundamentals, selectedRange, period, symbol, metric])

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1.5">
        <div className="mr-1 flex items-center rounded-md border bg-muted/40 p-0.5">
          {[
            { value: 'pe' as const, label: 'PER', title: 'Prix / bénéfice par action' },
            { value: 'ps' as const, label: 'P/S', title: 'Prix / chiffre d’affaires' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.title}
              aria-pressed={metric === option.value}
              onClick={() => setMetric(option.value)}
              className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                metric === option.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              period === p.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {p.label}
          </button>
        ))}
        <Button
          variant={isLogarithmic ? 'default' : 'outline'}
          size="sm"
          className="h-7 px-2 text-[10px] font-bold uppercase tracking-tight"
          onClick={() => setIsLogarithmic(!isLogarithmic)}
        >
          Log
        </Button>
      </div>
      <div className="h-[250px] w-full rounded-lg border bg-card/30 p-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm">Chargement...</div>
        ) : chartData.labels.length > 0 ? (
          <LineValue data={chartData} unit="x" isLogarithmic={isLogarithmic} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Données insuffisantes pour calculer l'historique du {metric === 'pe' ? 'PER' : 'P/S'}
          </div>
        )}
      </div>

      {period === 'max' && !loading && yearRange[0] !== yearRange[1] && (
        <div className="px-2 pt-2">
          <div className="mb-1 flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>
              Intervalle: {selectedRange[0]} - {selectedRange[1]}
            </span>
          </div>
          <Slider
            min={yearRange[0]}
            max={yearRange[1]}
            step={1}
            value={[selectedRange[0], selectedRange[1]]}
            onValueChange={(value) => setSelectedRange(value as [number, number])}
            className="py-2"
          />
        </div>
      )}
    </div>
  )
}
