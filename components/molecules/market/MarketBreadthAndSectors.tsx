'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Layers } from 'lucide-react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { MarketBreadthStats } from './MarketTopFlop'

interface MarketBreadthAndSectorsProps {
  stats: MarketBreadthStats | null
}

export function MarketBreadthAndSectors({ stats }: MarketBreadthAndSectorsProps) {
  if (!stats || stats.total === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/20 p-2.5">
      {/* 1. Advance / Decline Breadth Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>
              {stats.up} en hausse ({stats.upPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span>
              {stats.down} en baisse ({100 - stats.upPercent}%)
            </span>
            <TrendingDown className="h-3 w-3" />
          </div>
        </div>

        {/* Dual colored visual progress bar */}
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.upPercent}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${100 - stats.upPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Top and Bottom Sectors */}
      {(stats.topSectors.length > 0 || stats.bottomSectors.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-border/30 pt-1.5 text-[10px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Layers className="h-3 w-3 text-primary" />
            <span className="font-bold uppercase tracking-tight">Secteurs clés :</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {stats.topSectors.map((s) => (
              <div
                key={s.sector}
                className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <span>{s.sector}</span>
                <VariationContainer
                  value={s.avgPerf}
                  entity="%"
                  className="p-0 text-[9px] font-black"
                  background={false}
                />
              </div>
            ))}

            {stats.bottomSectors.map((s) => (
              <div
                key={s.sector}
                className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20"
              >
                <span>{s.sector}</span>
                <VariationContainer
                  value={s.avgPerf}
                  entity="%"
                  className="p-0 text-[9px] font-black"
                  background={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
