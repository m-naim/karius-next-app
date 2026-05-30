'use client'

import React, { useEffect, useState } from 'react'
import { getStockHistory } from '@/services/stock.service'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

interface MarketIndexSparklineProps {
  symbol: string
  color?: string
  period?: string
}

export function MarketIndexSparkline({ symbol, color = '#3b82f6', period = '1y' }: MarketIndexSparklineProps) {
  const [data, setData] = useState<{ value: number; date: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const historyData = await getStockHistory([symbol], period)
        const symbolHistory = historyData[symbol] || []
        if (symbolHistory.length > 0) {
          const formatted = symbolHistory.map((item: any) => {
            const dateObj = new Date(item.day * 24 * 60 * 60 * 1000)
            const dateStr = new Intl.DateTimeFormat('fr-FR', { 
              month: 'short', 
              day: 'numeric', 
              year: period.includes('y') ? '2-digit' : undefined 
            }).format(dateObj)
            
            return {
              value: item.close,
              date: dateStr
            }
          })
          setData(formatted)
        }
      } catch (error) {
        console.error(`Failed to fetch history for ${symbol}`, error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [symbol, period])

  if (loading) {
    return <Skeleton className="h-full w-full rounded" />
  }

  if (data.length === 0) {
    return <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Pas de données</div>
  }

  const isPositive = data[data.length - 1].value >= data[0].value
  const strokeColor = isPositive ? '#10b981' : '#ef4444' // emerald-500 or red-500
  const fillColor = isPositive ? '#10b98120' : '#ef444420'

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            width={40}
            orientation="right"
            tickFormatter={(val) => val.toFixed(0)}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'hsl(var(--background))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: strokeColor, fontSize: '12px', fontWeight: 'bold' }}
            formatter={(value: number) => [value.toFixed(2), symbol]}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px' }}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            fillOpacity={1}
            fill={`url(#color-${symbol})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
