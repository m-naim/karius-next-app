'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getQuotes } from '@/services/stock.service'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Skeleton } from '@/components/ui/skeleton'

const macroSymbols = ['SPY', 'QQQ', '^VIX']

export function MarketPulse() {
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarketPulse = async () => {
      try {
        const data = await getQuotes(macroSymbols)
        setMarketData(data)
      } catch (e) {
        console.error('Failed to fetch market pulse', e)
      } finally {
        setLoading(false)
      }
    }
    fetchMarketPulse()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {marketData.map((item, i) => (
        <motion.div
          key={item.symbol}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-lg"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">
            {item.symbol}
          </span>
          <span className="mt-1 text-sm font-black text-foreground">
            {item.regularMarketPrice?.toLocaleString('en-US', { 
                style: 'currency', 
                currency: item.currency || 'USD',
                maximumFractionDigits: 1 
            })}
          </span>
          <VariationContainer
            value={item.regularMarketChangePercent}
            className="mt-1 p-0 text-xs font-bold"
            background={false}
          />
        </motion.div>
      ))}
    </div>
  )
}
