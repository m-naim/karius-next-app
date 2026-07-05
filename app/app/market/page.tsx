'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { TrendingUp, Globe, ShieldCheck, PieChart, Landmark, ArrowRight, Activity, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarketPulse } from '@/components/molecules/market/MarketPulse'
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
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    description: 'Le cœur de l\'innovation technologique et de la croissance agressive.',
    icon: <PieChart className="h-5 w-5" />,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    symbol: 'QWLD',
    name: 'MSCI World Quality',
    description: 'Sélection mondiale d\'entreprises aux fondamentaux financiers irréprochables.',
    icon: <ShieldCheck className="h-5 w-5" />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    symbol: 'URTH',
    name: 'MSCI World',
    description: 'Le marché mondial global couvrant 23 pays développés.',
    icon: <Globe className="h-5 w-5" />,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    symbol: 'MEUD.PAR',
    name: 'STOXX Europe 600',
    description: 'La référence majeure du marché actions européen.',
    icon: <Landmark className="h-5 w-5" />,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    symbol: '^VIX',
    name: 'VIX Volatility',
    description: 'L\'indice de la peur. Mesure la volatilité attendue du S&P 500.',
    icon: <Activity className="h-5 w-5" />,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const periods = ['1d', '1w', '1m', '1y', '5y']

export default function MarketListingPage() {
  const [activeMarket, setActiveMarket] = useState(markets[0])
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [marketPerfs, setMarketPerfs] = useState<Record<string, number>>({})
  const [marketQuotes, setMarketQuotes] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchQuotesAndVariations = async () => {
      try {
        const symbols = markets.map(m => m.symbol)
        
        // Fetch quotes for real-time prices & 1d variation
        const quotesData = await getQuotes(symbols)
        const quotesMap: Record<string, any> = {}
        quotesData.forEach((q: any) => {
          quotesMap[q.symbol] = q
        })
        setMarketQuotes(quotesMap)

        // Fetch pre-calculated variations map for other periods (1w, 1m, 1y, 5y)
        const variationsData = await getStocksVariations(symbols)
        const variationsMap: Record<string, Record<string, number>> = {}
        variationsData.forEach((v: any) => {
          variationsMap[v.symbol] = v.variations
        })

        // Combine them to calculate perfs for current period
        const perfs: Record<string, number> = {}
        symbols.forEach(sym => {
          if (selectedPeriod === '1d') {
            perfs[sym] = quotesMap[sym]?.regularMarketChangePercent ?? 0
          } else {
            // Check variations map from database
            perfs[sym] = variationsMap[sym]?.[selectedPeriod] ?? 0
          }
        })
        setMarketPerfs(perfs)
      } catch (e) {
        console.error('Failed to fetch market metrics', e)
        
        // Fallback to history logic if anything fails
        try {
          const symbols = markets.map(m => m.symbol)
          const history = await getStockHistory(symbols, selectedPeriod)
          const perfs: Record<string, number> = {}
          symbols.forEach(sym => {
            const data = history[sym]
            if (data && data.length > 0) {
              const first = data[0].close
              const last = data[data.length - 1].close
              perfs[sym] = ((last - first) / first) * 100
            }
          })
          setMarketPerfs(perfs)
        } catch (err) {
          console.error('Fallback history calculation failed', err)
        }
      }
    }
    
    fetchQuotesAndVariations()
  }, [selectedPeriod])

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col space-y-8 py-8">
      {/* Dynamic Header */}
      <SectionContainer>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
              Pulse des <span className="text-primary">Marchés</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Surveillez la respiration de l'économie mondiale. Identifiez instantanément ce qui tire ou freine les marchés.
            </p>
          </div>
          <div className="relative flex items-center gap-1 rounded-full bg-muted/30 p-1 border border-border/40 backdrop-blur-md">
            {periods.map((p) => {
              const isActive = selectedPeriod === p
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all z-10',
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

      </SectionContainer>

      {/* The Command Center */}
      <SectionContainer className="flex-1 flex flex-col gap-6">
        {/* Ticker Tape */}
        <div 
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {markets.map((market) => {
            const isActive = activeMarket.symbol === market.symbol;
            const perf = marketPerfs[market.symbol];
            return (
              <button
                key={market.symbol}
                onClick={() => {
                   setActiveMarket(market);
                }}
                className={cn(
                  'relative flex-shrink-0 w-48 snap-start rounded-2xl border p-4 text-left transition-all duration-300 overflow-hidden',
                  isActive 
                    ? 'bg-background/80 backdrop-blur-md border-primary shadow-lg ring-1 ring-primary/50' 
                    : 'bg-muted/30 border-border/40 hover:bg-muted/50 hover:border-border/80'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-foreground">{market.name}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{market.symbol}</span>
                  </div>
                  <div className={cn('rounded-lg p-1.5', market.bg, market.color)}>
                    {market.icon}
                  </div>
                </div>
                {perf !== undefined && (
                  <VariationContainer value={perf} entity="%" className="text-lg font-black p-0" background={false} />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Index Deep Dive */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMarket.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Header of Active View */}
            <div className="flex items-end justify-between border-b border-border/50 pb-4">
              <div>
                <h2 className="text-3xl font-black text-foreground">{activeMarket.name}</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1 max-w-2xl">
                  {activeMarket.description}
                </p>
              </div>
              {activeMarket.symbol !== '^VIX' && (
                <Link href={`/app/market/${encodeURIComponent(activeMarket.symbol)}`}>
                  <button className="group flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                    <span>Analyse Complète</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              )}
            </div>

            {/* Body of Active View (Vertical Stack) */}
            <div className="flex flex-col gap-8">
              {/* Sparkline Section */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Tendance Globale ({selectedPeriod})
                </h3>
                <div className="h-[250px] w-full rounded-2xl border bg-background p-4 relative shadow-sm">
                  <MarketIndexSparkline 
                    symbol={activeMarket.symbol} 
                    period={selectedPeriod} 
                  />
                </div>
              </div>

              {/* Top / Flop Dynamics */}
              {activeMarket.symbol !== '^VIX' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Zap className="h-3 w-3 text-amber-500" /> Moteurs & Freins ({selectedPeriod})
                  </h3>
                  <div className="w-full rounded-2xl border bg-background p-4 shadow-sm">
                    <MarketTopFlop symbol={activeMarket.symbol} period={selectedPeriod} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </SectionContainer>
    </div>
  )
}
