'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { getStockHistory } from '@/services/stock.service'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { getStoredHistory, saveStoredHistory } from '@/services/marketCache'

interface MarketIndexSparklineProps {
  symbol: string
  period?: string
  initialData?: { value: number; date: string; rawDate: number }[]
}

const historyCache = new Map<string, { value: number; date: string; rawDate: number }[]>()

export function populateHistoryCache(symbol: string, period: string, rawHistory: any[]) {
  if (!rawHistory || rawHistory.length === 0) return
  const fetchPeriod = period === '1d' ? '1w' : period
  const cacheKey = `${symbol}_${fetchPeriod}`

  const formatted = rawHistory.map((item: any) => {
    const dateObj = new Date(item.day * 24 * 60 * 60 * 1000)
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: fetchPeriod.includes('y') ? '2-digit' : undefined,
    }).format(dateObj)

    return {
      value: item.close,
      date: dateStr,
      rawDate: item.day,
    }
  })

  historyCache.set(cacheKey, formatted)
  saveStoredHistory(symbol, fetchPeriod, formatted)
}

export function MarketIndexSparkline({ symbol, period = '1y', initialData }: MarketIndexSparklineProps) {
  // If period is 1d, backend may need 1w for multi-point curve
  const fetchPeriod = period === '1d' ? '1w' : period
  const cacheKey = `${symbol}_${fetchPeriod}`

  const [data, setData] = useState<{ value: number; date: string; rawDate: number }[]>(() => {
    if (initialData && initialData.length > 0) return initialData
    return []
  })

  const [loading, setLoading] = useState(() => !initialData || initialData.length === 0)

  useEffect(() => {
    let isMounted = true

    if (historyCache.has(cacheKey)) {
      setData(historyCache.get(cacheKey)!)
      setLoading(false)
    } else {
      const stored = getStoredHistory(symbol, fetchPeriod)
      if (stored && stored.length > 0) {
        historyCache.set(cacheKey, stored)
        setData(stored)
        setLoading(false)
      } else {
        setLoading(true)
      }
    }

    const fetchHistory = async () => {
      try {
        const historyData = await getStockHistory([symbol], fetchPeriod)
        const symbolHistory = historyData[symbol] || []
        if (symbolHistory.length > 0) {
          const formatted = symbolHistory.map((item: any) => {
            const dateObj = new Date(item.day * 24 * 60 * 60 * 1000)
            const dateStr = new Intl.DateTimeFormat('fr-FR', {
              month: 'short',
              day: 'numeric',
              year: fetchPeriod.includes('y') ? '2-digit' : undefined,
            }).format(dateObj)

            return {
              value: item.close,
              date: dateStr,
              rawDate: item.day,
            }
          })
          historyCache.set(cacheKey, formatted)
          saveStoredHistory(symbol, fetchPeriod, formatted)
          if (isMounted) {
            setData(formatted)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error(`Failed to fetch history for ${symbol}`, error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [symbol, fetchPeriod, cacheKey])

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null
    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const first = values[0]
    const last = values[values.length - 1]
    const diff = last - first
    const diffPercent = first > 0 ? (diff / first) * 100 : 0
    const isPositive = diff >= 0

    return { min, max, first, last, diff, diffPercent, isPositive }
  }, [data])

  if (loading && data.length === 0) {
    return <Skeleton className="h-full w-full rounded-lg" />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
        Aucune donnée historique disponible
      </div>
    )
  }

  const strokeColor = stats?.isPositive ? '#10b981' : '#ef4444' // emerald-500 or red-500
  const gradientId = `color-${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top summary stats */}
      {stats && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Min : <strong className="text-foreground">{stats.min.toFixed(1)}</strong>
            </span>
            <span className="text-muted-foreground">
              Max : <strong className="text-foreground">{stats.max.toFixed(1)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Amplitude :</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                stats.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {stats.isPositive ? '+' : ''}
              {stats.diffPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div className="flex-1 min-h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              minTickGap={32}
            />
            <YAxis
              domain={['dataMin', 'dataMax']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={45}
              orientation="right"
              tickFormatter={(val) => Number(val).toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '8px 12px',
              }}
              itemStyle={{ color: strokeColor, fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value: any) => [
                Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 2 }),
                symbol,
              ]}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '2px' }}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
