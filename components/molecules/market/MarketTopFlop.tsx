'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import marketService from '@/services/marketService'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'
import SecurityImage from '@/components/atoms/SecurityImage'
import { Actions } from 'app/app/watchlist/[id]/components/Actions'
import { getStoredTopFlop, saveStoredTopFlop } from '@/services/marketCache'

const holdingsCache = new Map<string, any[]>()
const topFlopComputedCache = new Map<string, { top: any[]; flop: any[]; stats?: any }>()

export interface MarketBreadthStats {
  total: number
  up: number
  down: number
  flat: number
  upPercent: number
  topSectors: { sector: string; avgPerf: number }[]
  bottomSectors: { sector: string; avgPerf: number }[]
}

interface MarketTopFlopProps {
  symbol: string
  period: string
  allWatchlists?: any[]
  onStatsLoaded?: (stats: MarketBreadthStats) => void
}

export function MarketTopFlop({
  symbol,
  period,
  allWatchlists = [],
  onStatsLoaded,
}: MarketTopFlopProps) {
  const cacheKey = `${symbol.toUpperCase()}_${period}`

  const [data, setData] = useState<{ top: any[]; flop: any[] } | null>(() => {
    if (topFlopComputedCache.has(cacheKey)) {
      const cached = topFlopComputedCache.get(cacheKey)!
      return { top: cached.top, flop: cached.flop }
    }
    const stored = getStoredTopFlop(symbol, period)
    if (stored) {
      topFlopComputedCache.set(cacheKey, stored)
      return { top: stored.top, flop: stored.flop }
    }
    return null
  })

  const [loading, setLoading] = useState(() => !data)

  useEffect(() => {
    let isMounted = true

    // If we have stored stats, deliver them immediately
    const stored = topFlopComputedCache.get(cacheKey) || getStoredTopFlop(symbol, period)
    if (stored) {
      if (stored.stats && onStatsLoaded) {
        onStatsLoaded(stored.stats)
      }
      if (!data) {
        setData({ top: stored.top, flop: stored.flop })
        setLoading(false)
      }
    }

    const getPerf = (s: any) => {
      if (!s) return 0
      if (period === '1d') return s.regularMarketChangePercent ?? 0
      return s.variations?.[period] ?? s.regularMarketChangePercent ?? 0
    }

    const processHoldings = (holdings: any[]) => {
      const validHoldings = (holdings || []).filter((s) => s && s.symbol)
      if (validHoldings.length === 0) {
        if (isMounted) {
          setData({ top: [], flop: [] })
          setLoading(false)
        }
        return
      }

      const sorted = [...validHoldings].sort((a, b) => getPerf(b) - getPerf(a))
      const top = sorted.slice(0, 5)
      const flop = sorted.slice(-5).reverse()

      // Calculate breadth
      let up = 0
      let down = 0
      let flat = 0
      const sectorMap: Record<string, { count: number; totalPerf: number }> = {}

      validHoldings.forEach((s) => {
        const perf = getPerf(s)
        if (perf > 0.05) up++
        else if (perf < -0.05) down++
        else flat++

        const sector = (s.sector && s.sector.trim()) || 'Autre'
        if (!sectorMap[sector]) {
          sectorMap[sector] = { count: 0, totalPerf: 0 }
        }
        sectorMap[sector].count++
        sectorMap[sector].totalPerf += perf
      })

      const sectors = Object.entries(sectorMap)
        .filter(([_, data]) => data.count >= 2)
        .map(([sector, data]) => ({
          sector,
          avgPerf: data.totalPerf / data.count,
        }))
        .sort((a, b) => b.avgPerf - a.avgPerf)

      const topSectors = sectors.slice(0, 2)
      const bottomSectors = sectors.slice(-2).reverse()

      const stats: MarketBreadthStats = {
        total: validHoldings.length,
        up,
        down,
        flat,
        upPercent: Math.round((up / validHoldings.length) * 100),
        topSectors,
        bottomSectors,
      }

      topFlopComputedCache.set(cacheKey, { top, flop, stats })
      saveStoredTopFlop(symbol, period, { top, flop, stats })

      if (isMounted) {
        setData({ top, flop })
        setLoading(false)
        if (onStatsLoaded) {
          onStatsLoaded(stats)
        }
      }
    }

    if (holdingsCache.has(symbol)) {
      processHoldings(holdingsCache.get(symbol)!)
    } else {
      if (!data) setLoading(true)
    }

    const fetchHoldings = async () => {
      try {
        await marketService.getProgressive(symbol, (progressiveData) => {
          if (!progressiveData || !progressiveData.holdings) return
          holdingsCache.set(symbol, progressiveData.holdings)
          processHoldings(progressiveData.holdings)
        })
      } catch (error) {
        console.error('Failed to load top/flop for', symbol, error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchHoldings()

    return () => {
      isMounted = false
    }
  }, [symbol, period, cacheKey, onStatsLoaded])

  const getPerf = (s: any) => {
    if (!s) return 0
    if (period === '1d') return s.regularMarketChangePercent ?? 0
    return s.variations?.[period] ?? s.regularMarketChangePercent ?? 0
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-3 py-1">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || (data.top.length === 0 && data.flop.length === 0)) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
        Aucun composant disponible pour cet indice
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top 5 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500">
            <TrendingUp className="h-3 w-3" />
            <span>Moteurs • Top 5</span>
          </div>
          <span className="text-[9px] font-bold uppercase text-muted-foreground">
            Hausse
          </span>
        </div>

        <div className="space-y-1">
          {data.top.map((s, i) => (
            <div
              key={s.symbol || i}
              className="group/item flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-2 py-1 text-xs transition-all hover:border-emerald-500/40 hover:bg-card shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-3.5 text-center text-[9px] font-black text-muted-foreground">
                  {i + 1}
                </span>

                <div className="h-4 w-4 shrink-0 overflow-hidden rounded bg-muted/40 p-0.5">
                  <SecurityImage symbol={s.symbol} />
                </div>

                <Link
                  href={`/app/stocks/${encodeURIComponent(s.symbol)}`}
                  className="min-w-0 truncate flex-1 hover:underline cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-foreground truncate text-xs">
                      {s.symbol}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                      {s.shortname || s.longname || s.sector}
                    </span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <VariationContainer
                  value={getPerf(s)}
                  entity="%"
                  className="p-0 text-[11px] font-black"
                  background={false}
                />

                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <Actions
                    symbol={s.symbol}
                    allWatchlists={allWatchlists}
                    security={s}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flop 5 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-500">
            <TrendingDown className="h-3 w-3" />
            <span>Freins • Flop 5</span>
          </div>
          <span className="text-[9px] font-bold uppercase text-muted-foreground">
            Baisse
          </span>
        </div>

        <div className="space-y-1">
          {data.flop.map((s, i) => (
            <div
              key={s.symbol || i}
              className="group/item flex items-center justify-between rounded-lg border border-border/40 bg-card/60 px-2 py-1 text-xs transition-all hover:border-rose-500/40 hover:bg-card shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-3.5 text-center text-[9px] font-black text-muted-foreground">
                  {i + 1}
                </span>

                <div className="h-4 w-4 shrink-0 overflow-hidden rounded bg-muted/40 p-0.5">
                  <SecurityImage symbol={s.symbol} />
                </div>

                <Link
                  href={`/app/stocks/${encodeURIComponent(s.symbol)}`}
                  className="min-w-0 truncate flex-1 hover:underline cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-black text-foreground truncate text-xs">
                      {s.symbol}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                      {s.shortname || s.longname || s.sector}
                    </span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <VariationContainer
                  value={getPerf(s)}
                  entity="%"
                  className="p-0 text-[11px] font-black"
                  background={false}
                />

                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <Actions
                    symbol={s.symbol}
                    allWatchlists={allWatchlists}
                    security={s}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
