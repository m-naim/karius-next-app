'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Globe,
  ShieldCheck,
  PieChart,
  Landmark,
  ArrowRight,
  Activity,
  Sparkles,
  Flame,
  LineChart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarketIndexSparkline, populateHistoryCache } from '@/components/molecules/market/MarketIndexSparkline'
import { MarketTopFlop, MarketBreadthStats } from '@/components/molecules/market/MarketTopFlop'
import { MarketVixCockpit } from '@/components/molecules/market/MarketVixCockpit'
import { MarketBreadthAndSectors } from '@/components/molecules/market/MarketBreadthAndSectors'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { getQuotes, getStocksVariations, getStockHistory } from '@/services/stock.service'
import marketService from '@/services/marketService'
import watchListService from '@/services/watchListService'
import { getStoredMarketOverview, saveStoredMarketOverview } from '@/services/marketCache'
import { cn } from '@/lib/utils'

interface MarketMeta {
  symbol: string
  name: string
  subtitle: string
  constituentsCount: string
  icon: any
  color: string
  bg: string
}

const MARKETS: MarketMeta[] = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    subtitle: 'Grandes capitalisations US',
    constituentsCount: '500 actions',
    icon: TrendingUp,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    subtitle: 'Tech & Croissance US',
    constituentsCount: '100 actions',
    icon: PieChart,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    symbol: 'URTH',
    name: 'MSCI World',
    subtitle: 'Marchés Développés',
    constituentsCount: '1 400+ actions',
    icon: Globe,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    symbol: 'MEUD.PAR',
    name: 'STOXX 600',
    subtitle: 'Actions Européennes',
    constituentsCount: '600 actions',
    icon: Landmark,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    symbol: 'QWLD',
    name: 'MSCI Quality',
    subtitle: 'Facteur Qualité & ROE',
    constituentsCount: 'Sélection Qualité',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    symbol: '^VIX',
    name: 'VIX',
    subtitle: 'Indice de Volatilité',
    constituentsCount: 'Indice Macro',
    icon: Activity,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const PERIODS = [
  { key: '1d', label: '1J' },
  { key: '1w', label: '1S' },
  { key: '1m', label: '1M' },
  { key: '1y', label: '1A' },
  { key: '5y', label: '5A' },
]

export default function MarketListingPage() {
  const [activeMarket, setActiveMarket] = useState<MarketMeta>(MARKETS[0])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1d')

  // Instant SWR state initialization from storage (0ms paint)
  const [marketQuotes, setMarketQuotes] = useState<Record<string, any>>(() => {
    return getStoredMarketOverview()?.quotes || {}
  })
  const [marketVariations, setMarketVariations] = useState<Record<string, Record<string, number>>>(() => {
    return getStoredMarketOverview()?.variations || {}
  })
  const [watchlists, setWatchlists] = useState<any[]>([])
  const [breadthStats, setBreadthStats] = useState<MarketBreadthStats | null>(null)

  const hasPrefetchedRest = useRef(false)

  useEffect(() => {
    let isMounted = true
    const symbols = MARKETS.map((m) => m.symbol)

    const fetchMarketOverview = async () => {
      try {
        const [quotesData, variationsData, userWatchlists, batchHistory] = await Promise.all([
          getQuotes(symbols).catch(() => []),
          getStocksVariations(symbols).catch(() => []),
          watchListService.getAll().catch(() => []),
          // Pre-fetch historical sparklines for ALL 6 indices in 1 single HTTP call!
          getStockHistory(symbols, selectedPeriod === '1d' ? '1w' : selectedPeriod).catch(() => ({})),
        ])

        if (!isMounted) return

        const qMap: Record<string, any> = {}
        if (Array.isArray(quotesData)) {
          quotesData.forEach((q: any) => {
            if (q?.symbol) qMap[q.symbol] = q
          })
        }
        setMarketQuotes(qMap)

        const vMap: Record<string, Record<string, number>> = {}
        if (Array.isArray(variationsData)) {
          variationsData.forEach((v: any) => {
            if (v?.symbol) vMap[v.symbol] = v.variations || {}
          })
        }
        setMarketVariations(vMap)
        setWatchlists(userWatchlists || [])

        // Save fresh snapshot to persistent storage
        if (Object.keys(qMap).length > 0) {
          saveStoredMarketOverview(qMap, vMap)
        }

        // Cache batch sparklines for all 6 indices
        if (batchHistory && typeof batchHistory === 'object') {
          Object.entries(batchHistory).forEach(([sym, history]) => {
            if (Array.isArray(history) && history.length > 0) {
              populateHistoryCache(sym, selectedPeriod, history)
            }
          })
        }

        // Background idle prefetch of other index holdings so clicking them is 0ms
        if (!hasPrefetchedRest.current) {
          hasPrefetchedRest.current = true
          setTimeout(() => {
            MARKETS.filter((m) => m.symbol !== '^VIX' && m.symbol !== activeMarket.symbol).forEach((m) => {
              marketService.prefetch(m.symbol)
            })
          }, 300)
        }
      } catch (err) {
        console.error('Failed to load market overview:', err)
      }
    }

    fetchMarketOverview()
    return () => {
      isMounted = false
    }
  }, [selectedPeriod, activeMarket.symbol])

  // Reset breadth when active market changes
  useEffect(() => {
    setBreadthStats(null)
  }, [activeMarket.symbol])

  const getPerformance = (symbol: string) => {
    if (selectedPeriod === '1d') {
      return marketQuotes[symbol]?.regularMarketChangePercent ?? null
    }
    return marketVariations[symbol]?.[selectedPeriod] ?? null
  }

  const activeQuote = marketQuotes[activeMarket.symbol]
  const activePerf = getPerformance(activeMarket.symbol)
  const isVix = activeMarket.symbol === '^VIX'
  const vixQuote = marketQuotes['^VIX']

  return (
    <div className="flex flex-col gap-3 px-3 py-3 md:px-6 md:py-4 max-w-6xl mx-auto w-full">
      {/* 1. Top Header Bar: Titre + Macro VIX Pulse + Sélecteur de Période */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
            Marchés &amp; <span className="text-primary">Indices</span>
          </h1>

          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">
            <Sparkles className="h-2.5 w-2.5" /> Direct
          </span>

          {/* VIX quick pulse indicator */}
          {vixQuote?.regularMarketPrice != null && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground shadow-2xs">
              <Activity className="h-3 w-3 text-rose-500" />
              <span>VIX: {vixQuote.regularMarketPrice.toFixed(1)}</span>
              <span className="text-foreground">
                ({vixQuote.regularMarketPrice < 15 ? 'Calme' : vixQuote.regularMarketPrice < 20 ? 'Modéré' : 'Tension'})
              </span>
            </div>
          )}
        </div>

        {/* Sélecteur de période ultra-compact */}
        <div className="flex items-center gap-0.5 rounded-lg bg-muted/40 border border-border/60 p-0.5">
          {PERIODS.map(({ key, label }) => {
            const isActive = selectedPeriod === key
            return (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={cn(
                  'relative px-2 py-0.5 text-xs font-black uppercase transition-all rounded-md',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="market-period-pill"
                    className="absolute inset-0 rounded-md bg-background shadow-xs border border-border/40"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Boutons d'Indices (Compact & Responsive avec Instant Switch) */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
        {MARKETS.map((market) => {
          const isActive = activeMarket.symbol === market.symbol
          const perf = getPerformance(market.symbol)
          const quote = marketQuotes[market.symbol]
          const Icon = market.icon

          return (
            <button
              key={market.symbol}
              onClick={() => setActiveMarket(market)}
              onMouseEnter={() => market.symbol !== '^VIX' && marketService.prefetch(market.symbol)}
              className={cn(
                'relative flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left transition-all duration-150',
                isActive
                  ? 'bg-card border-primary ring-1 ring-primary/40 shadow-xs'
                  : 'bg-card/40 border-border/60 hover:bg-card hover:border-border'
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={cn('shrink-0 rounded p-1', market.bg, market.color)}>
                  <Icon className="h-3 w-3" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-xs font-bold text-foreground leading-tight">
                    {market.name}
                  </span>
                  <span className="block text-[9px] font-medium text-muted-foreground leading-none">
                    {quote?.regularMarketPrice != null
                      ? quote.regularMarketPrice.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: quote.currency || 'USD',
                          maximumFractionDigits: 1,
                        })
                      : market.symbol}
                  </span>
                </div>
              </div>

              <div className="shrink-0 min-h-[16px] flex items-center ml-1">
                {perf != null ? (
                  <VariationContainer
                    value={perf}
                    entity="%"
                    className="p-0 text-[10px] font-black"
                    background={false}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">--</span>
                )}
              </div>

              {isActive && (
                <div className="absolute -bottom-[1px] left-2 right-2 h-[2px] bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* 3. Bandeau d'Action Rapide de l'Indice Actif */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-2 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-foreground truncate">
                {activeMarket.name}
              </span>
              <span className="rounded bg-muted/60 px-1.5 py-0.2 text-[9px] font-black uppercase text-muted-foreground">
                {activeMarket.symbol}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {activeMarket.subtitle}
            </span>
          </div>

          <div className="h-5 w-[1px] bg-border/60 hidden sm:block" />

          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-xs font-black text-foreground">
              {activeQuote?.regularMarketPrice != null
                ? activeQuote.regularMarketPrice.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: activeQuote.currency || 'USD',
                    maximumFractionDigits: 2,
                  })
                : '--'}
            </span>
            {activePerf != null && (
              <VariationContainer
                value={activePerf}
                entity="%"
                className="p-0 text-xs font-black"
                background={false}
              />
            )}
          </div>
        </div>

        {/* CTA Direct vers la composition ou Indice Synthétique */}
        {!isVix ? (
          <Link
            href={`/app/market/${encodeURIComponent(activeMarket.symbol)}`}
            onMouseEnter={() => marketService.prefetch(activeMarket.symbol)}
            className="shrink-0"
          >
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90">
              <span>Voir la composition ({activeMarket.constituentsCount})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </Link>
        ) : (
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 border border-rose-500/20">
            Baromètre Macro / Volatilité
          </span>
        )}
      </div>

      {/* 4. Contenu Principal :
             - Si VIX : Cockpit Macro & Volatilité
             - Si Indice Actions : Graphique + Secteurs (8 cols) + Top / Flop Moteurs (4 cols)
      */}
      <AnimatePresence mode="wait">
        {isVix ? (
          <motion.div
            key="vix-cockpit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <MarketVixCockpit vixQuote={vixQuote} period={selectedPeriod} />
          </motion.div>
        ) : (
          <motion.div
            key={`${activeMarket.symbol}_${selectedPeriod}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-3 lg:grid-cols-12"
          >
            {/* Colonne Gauche : Graphique historique + Breadth & Baromètre Sectoriel (8 cols) */}
            <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-xs lg:col-span-8">
              <div>
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <LineChart className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      Tendance Historique ({PERIODS.find((p) => p.key === selectedPeriod)?.label})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {activeMarket.name}
                  </span>
                </div>

                {/* Graphique */}
                <div className="h-[210px] sm:h-[240px] w-full pt-1">
                  <MarketIndexSparkline
                    key={`${activeMarket.symbol}_${selectedPeriod}`}
                    symbol={activeMarket.symbol}
                    period={selectedPeriod}
                  />
                </div>
              </div>

              {/* Breadth & Sector Barometer */}
              <MarketBreadthAndSectors stats={breadthStats} />
            </div>

            {/* Colonne Droite : Moteurs du Marché (Top / Flop) avec Actions rapides (4 cols) */}
            <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-xs lg:col-span-4">
              <div>
                <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                      Moteurs du Jour ({PERIODS.find((p) => p.key === selectedPeriod)?.label})
                    </span>
                  </div>
                </div>

                {/* Composant Top/Flop */}
                <MarketTopFlop
                  key={`${activeMarket.symbol}_${selectedPeriod}`}
                  symbol={activeMarket.symbol}
                  period={selectedPeriod}
                  allWatchlists={watchlists}
                  onStatsLoaded={setBreadthStats}
                />
              </div>

              {/* Lien vers le tableau complet */}
              <div className="border-t border-border/40 pt-2 mt-3 text-center">
                <Link
                  href={`/app/market/${encodeURIComponent(activeMarket.symbol)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <span>Explorer le tableau complet ({activeMarket.name})</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
