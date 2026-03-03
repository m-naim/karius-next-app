'use client'
import { useEffect, useState } from 'react'
import { getFundamentals, getStockHistory } from '@/services/stock.service'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { format } from 'date-fns'

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
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] })

  useEffect(() => {
    setLoading(true)
    Promise.all([getStockHistory([symbol], period), getFundamentals(symbol)])
      .then(([historyRes, fundamentals]) => {
        const history = historyRes[symbol] || []
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

        history.forEach((item, index) => {
          // Downsample data based on period to keep chart responsive
          if (index % sampleRate !== 0 && index !== history.length - 1) return

          const itemDate = new Date(item.day * 24 * 60 * 60 * 1000)

          // Find the last 4 quarters prior to this date
          const priorQuarters = quarterly.filter(
            (q) => new Date(q.fiscalDate).getTime() <= itemDate.getTime()
          )

          const last4 = priorQuarters.slice(-4)
          if (last4.length === 4) {
            const ttmEps = last4.reduce((sum, q) => sum + (q.eps || 0), 0)
            if (ttmEps > 0) {
              labels.push(format(itemDate, 'dd/MM/yyyy'))
              data.push(item.close / ttmEps)
            }
          }
        })

        setChartData({
          labels,
          datasets: [
            {
              label: 'PER (TTM)',
              data,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
            },
          ],
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch PER history data:', err)
        setLoading(false)
      })
  }, [symbol, period])

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-1.5">
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
      </div>
      <div className="h-[250px] w-full rounded-lg border bg-card/30 p-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm">Chargement...</div>
        ) : chartData.labels.length > 0 ? (
          <LineValue data={chartData} unit="x" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Données insuffisantes pour calculer l'historique du PER
          </div>
        )}
      </div>
    </div>
  )
}
