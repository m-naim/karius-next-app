'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Globe, ShieldCheck, PieChart, Landmark, ArrowRight, Activity, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarketIndexSparkline } from '@/components/molecules/market/MarketIndexSparkline'
import { MarketTopFlop } from '@/components/molecules/market/MarketTopFlop'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { getStockHistory, getQuotes, getStocksVariations } from '@/services/stock.service'
import { cn } from '@/lib/utils'

const markets = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    description: 'Les 500 plus grandes entreprises américaines. Le poumon de la finance mondiale.',
    icon: TrendingUp,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    description: "Le cœur de l'innovation technologique et de la croissance agressive.",
    icon: PieChart,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    symbol: 'QWLD',
    name: 'MSCI World Quality',
    description: "Sélection mondiale d'entreprises aux fondamentaux financiers irréprochables.",
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    symbol: 'URTH',
    name: 'MSCI World',
    description: 'Le marché mondial global couvrant 23 pays développés.',
    icon: Globe,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    symbol: 'MEUD.PAR',
    name: 'STOXX Europe 600',
    description: 'La référence majeure du marché actions européen.',
    icon: Landmark,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    symbol: '^VIX',
    name: 'VIX Volatility',
    description: "L'indice de la peur. Mesure la volatilité attendue du S&P 500.",
    icon: Activity,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const periods = ['1d', '1w', '1m', '1y', '5y']

export default function MarketListingPage() {
  const [activeMarket, setActiveMarket] = useState(markets[0])
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [marketPerfs, setMarketPerfs] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchQuotesAndVariations = async () => {
      const symbols = markets.map((m) => m.symbol)
      const quotesMap: Record<string, any> = {}
      const variationsMap: Record<string, Record<string, number>> = {}

      try {
        const quotesData = await getQuotes(symbols)
        if (Array.isArray(quotesData)) {
          quotesData.forEach((q: any) => {
            if (q?.symbol) quotesMap[q.symbol] = q
          })
        }
      } catch (err) {
        console.error('Failed to load market quotes', err)
      }

      try {
        const variationsData = await getStocksVariations(symbols)
        if (Array.isArray(variationsData)) {
          variationsData.forEach((v: any) => {
            if (v?.symbol) variationsMap[v.symbol] = v.variations
          })
        }
      } catch (err) {
        console.error('Failed to load market variations', err)
      }

      const perfs: Record<string, number> = {}
      symbols.forEach((sym) => {
        if (selectedPeriod === '1d') {
          perfs[sym] = quotesMap[sym]?.regularMarketChangePercent ?? 0
        } else {
          perfs[sym] = variationsMap[sym]?.[selectedPeriod] ?? 0
        }
      })
      setMarketPerfs(perfs)
    }

    fetchQuotesAndVariations()
  }, [selectedPeriod])

  return (
    <div className="flex min-h-[calc(100dvh-60px)] flex-col gap-4 px-3 py-4 md:gap-6 md:px-6 md:py-8">

      {/* Page Header — titre + sélecteur de période */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-foreground sm:text-3xl md:text-4xl">
            Pulse des <span className="text-primary">Marchés</span>
          </h1>
          <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block sm:text-sm">
            Surveillez la respiration de l&apos;économie mondiale.
          </p>
        </div>
        <div className="relative flex items-center self-start rounded-full bg-muted/40 p-1 border border-border/60 sm:self-auto">
          {periods.map((p) => {
            const isActive = selectedPeriod === p
            return (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                aria-pressed={isActive}
                className={cn(
                  'relative rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all z-10',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-period"
                    className="absolute inset-0 rounded-full bg-background shadow-sm border border-border/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ticker Tape — scroll horizontal, cartes compactes sur mobile */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden md:gap-4 shrink-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {markets.map((market) => {
          const isActive = activeMarket.symbol === market.symbol
          const perf = marketPerfs[market.symbol]
          const Icon = market.icon

          return (
            <button
              key={market.symbol}
              onClick={() => setActiveMarket(market)}
              className={cn(
                'relative flex flex-col justify-between shrink-0 min-h-[76px] w-[140px] snap-start rounded-xl border p-3 text-left transition-all duration-200 md:min-h-[92px] md:w-48 md:rounded-2xl md:p-4',
                isActive
                  ? 'bg-card border-primary shadow-sm ring-1 ring-primary/30'
                  : 'bg-card/40 border-border/60 hover:bg-card/80 hover:border-border/80'
              )}
            >
              <div className="flex justify-between items-start w-full gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-bold leading-tight text-foreground md:text-sm">{market.name}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{market.symbol}</span>
                </div>
                <div className={cn('shrink-0 rounded-md p-1 md:rounded-lg md:p-1.5', market.bg, market.color)}>
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>
              </div>
              <div className="mt-2">
                {perf !== undefined ? (
                  <VariationContainer value={perf} entity="%" className="text-xs font-black p-0 md:text-base" background={false} />
                ) : (
                  <span className="text-xs text-muted-foreground">--</span>
                )}
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-xl" />
              )}
            </button>
          )
        })}
      </div>

      {/* Active Index Deep Dive */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMarket.symbol}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 md:gap-6"
        >
          {/* En-tête: titre + bouton — colonne sur mobile, ligne sur sm+ */}
          <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:items-end sm:justify-between sm:pb-4">
            <div>
              <h2 className="text-lg font-black text-foreground sm:text-2xl md:text-3xl">{activeMarket.name}</h2>
              <p className="mt-0.5 max-w-2xl text-xs font-medium text-muted-foreground sm:text-sm">
                {activeMarket.description}
              </p>
            </div>
            {activeMarket.symbol !== '^VIX' && (
              <Link
                href={`/app/market/${encodeURIComponent(activeMarket.symbol)}`}
                className="self-start sm:self-auto shrink-0"
              >
                <button className="group flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                  <span>Analyse Complète</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            )}
          </div>

          {/* Corps: sparkline + top/flop */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Activity className="h-3 w-3" /> Tendance ({selectedPeriod})
              </h3>
              <div className="h-[180px] w-full rounded-xl border bg-background p-3 shadow-sm md:h-[250px] md:p-4">
                <MarketIndexSparkline symbol={activeMarket.symbol} period={selectedPeriod} />
              </div>
            </div>

            {activeMarket.symbol !== '^VIX' && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Zap className="h-3 w-3 text-amber-500" /> Moteurs &amp; Freins ({selectedPeriod})
                </h3>
                <div className="w-full rounded-xl border bg-background p-3 shadow-sm md:p-4">
                  <MarketTopFlop symbol={activeMarket.symbol} period={selectedPeriod} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
