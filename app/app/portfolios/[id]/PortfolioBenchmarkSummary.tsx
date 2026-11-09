'use client'

import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { getPerformances } from '@/services/portfolioService'

const benchmarks = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^FCHI', label: 'CAC 40' },
  { symbol: '^STOXX50E', label: 'EURO STOXX 50' },
]

export default function PortfolioBenchmarkSummary({ portfolioId, baseCurrency = 'EUR' }: { portfolioId: string; baseCurrency?: string }) {
  const [performance, setPerformance] = useState<Record<string, number>>({})

  useEffect(() => {
    let active = true
    getPerformances(portfolioId, benchmarks.map(({ symbol }) => symbol), 365)
      .then((result) => {
        if (!active) return
        const values: Record<string, number> = {}
        benchmarks.forEach(({ symbol }) => {
          const series = result.benchmarks?.[symbol]
          if (series?.length && Number.isFinite(series[series.length - 1])) values[symbol] = series[series.length - 1]
        })
        setPerformance(values)
      })
      .catch((error) => console.error('Unable to load portfolio benchmark summary', error))
    return () => { active = false }
  }, [portfolioId])

  if (!Object.keys(performance).length) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        Benchmarks · 1 an · convertis en {baseCurrency}
      </span>
      {benchmarks.filter(({ symbol }) => performance[symbol] != null).map(({ symbol, label }) => (
        <span key={symbol} className="inline-flex items-center gap-1.5">
          <span className="text-muted-foreground">{label}</span>
          <VariationContainer value={performance[symbol]} entity="%" background={false} className="m-0 p-0 font-semibold" />
        </span>
      ))}
    </div>
  )
}
