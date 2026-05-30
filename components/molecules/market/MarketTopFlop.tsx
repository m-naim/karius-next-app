'use client'

import React, { useEffect, useState } from 'react'
import marketService from '@/services/marketService'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketTopFlop({ symbol, period }: { symbol: string; period: string }) {
  const [data, setData] = useState<{ top: any[]; flop: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true)
        const info = await marketService.get(symbol)
        if (!info || !info.holdings) return

        const getPerf = (s: any) => {
          if (period === '1d') return s.regularMarketChangePercent || 0
          return s.variations?.[period] || 0
        }

        const sorted = [...info.holdings].sort((a, b) => getPerf(b) - getPerf(a))
        const top = sorted.slice(0, 5)
        const flop = sorted.slice(-5).reverse() // reverse so worst is first

        setData({ top, flop })
      } catch (error) {
        console.error('Failed to load top/flop for', symbol, error)
      } finally {
        setLoading(false)
      }
    }

    fetchHoldings()
  }, [symbol, period])

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const getPerf = (s: any) => {
    if (period === '1d') return s.regularMarketChangePercent || 0
    return s.variations?.[period] || 0
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
      <div className="space-y-1.5">
        <div className="text-[10px] font-black uppercase text-green-600 mb-2">Top 5</div>
        {data.top.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">{s.symbol}</span>
            <VariationContainer value={getPerf(s)} entity="%" className="p-0 text-[10px] font-black" background={false} />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] font-black uppercase text-red-600 mb-2">Flop 5</div>
        {data.flop.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground">{s.symbol}</span>
            <VariationContainer value={getPerf(s)} entity="%" className="p-0 text-[10px] font-black" background={false} />
          </div>
        ))}
      </div>
    </div>
  )
}
