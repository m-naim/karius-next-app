'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { TrendingUp, Globe, ShieldCheck, PieChart, Landmark, ArrowRight, ArrowLeft, Activity, Zap } from 'lucide-react'
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
  const [mobileView, setMobileView] = useState<'list' | 'details'>('list')

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
              Market <span className="text-primary">Pulse</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-muted-foreground">
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
      <SectionContainer className="flex-1">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8 h-full">
          
          {/* Left Column: Index Ribbon */}
          <div className={cn("flex flex-col gap-3 md:col-span-4", mobileView === 'details' && "hidden md:flex")}>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Indices Majeurs
            </h2>
            <div 
              className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {markets.map((market) => {
                const isActive = activeMarket.symbol === market.symbol
                const perf = marketPerfs[market.symbol]
                
                return (
                  <button
                    key={market.symbol}
                    onClick={() => {
                      setActiveMarket(market)
                      setMobileView('details')
                    }}
                    className={cn(
                      'group relative flex flex-col md:flex-row md:items-center justify-between w-36 md:w-full h-36 md:h-auto shrink-0 snap-start rounded-3xl border p-4 text-left transition-all duration-300 overflow-hidden',
                      isActive 
                        ? 'bg-background border-primary/30 shadow-lg ring-1 ring-primary/20 scale-[0.98]' 
                        : 'bg-muted/10 border-border/40 hover:bg-muted/30 hover:border-border/80'
                    )}
                  >
                    <div className="flex md:flex-1 items-center justify-between w-full md:w-auto">
                      <div className={cn('rounded-xl p-2 transition-colors shrink-0', isActive ? market.bg + ' ' + market.color : 'bg-muted/80 text-muted-foreground')}>
                        {market.icon}
                      </div>
                      <div className="flex flex-col min-w-0 ml-3 hidden md:flex">
                        <span className={cn('text-sm font-bold transition-colors truncate', isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
                          {market.name}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                          {market.symbol}
                        </span>
                      </div>
                      {perf !== undefined && (
                        <div className="shrink-0 ml-2 md:hidden">
                          <VariationContainer value={perf} entity="%" className="text-[10px] font-black p-0" background={false} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0 mt-3 md:hidden">
                      <span className={cn('text-xs font-bold transition-colors truncate', isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
                        {market.name}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                        {market.symbol}
                      </span>
                    </div>

                    {perf !== undefined && (
                      <div className="shrink-0 hidden md:block">
                        <VariationContainer value={perf} entity="%" className="text-xs font-black p-0" background={false} />
                      </div>
                    )}

                    {isActive && (
                      <>
                        <motion.div 
                          layoutId="active-indicator-mobile" 
                          className="absolute bottom-0 left-0 right-0 h-1 bg-primary md:hidden" 
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                        <motion.div 
                          layoutId="active-indicator-desktop" 
                          className="absolute right-0 top-0 bottom-0 w-1 bg-primary hidden md:block" 
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      </>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Why Watch? Info Card */}
            <div className="mt-4 rounded-2xl bg-muted/30 border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Zap className="h-3 w-3 text-amber-500" /> Le saviez-vous ?
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                L'indice <strong>VIX</strong> monte quand la peur s'installe. Si le S&P 500 baisse et que le VIX explose, c'est un vent de panique. Surveiller le Top/Flop des actions américaines pendant ces périodes permet d'identifier les valeurs résilientes.
              </p>
            </div>
          </div>

          {/* Right Column: The Deep Dive */}
          <div className={cn("md:col-span-8 flex flex-col h-full", mobileView === 'list' && "hidden md:flex")}>
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileView('list')}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-4 py-2 text-xs font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground mb-4 md:hidden max-w-max"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux indices</span>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMarket.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full rounded-3xl border bg-background shadow-xl overflow-hidden"
              >
                {/* Header of Active View */}
                <div className="flex items-start justify-between border-b p-6 bg-muted/10">
                  <div className="flex items-center gap-4">
                     <div className={cn('rounded-2xl p-4', activeMarket.bg, activeMarket.color)}>
                        {activeMarket.icon}
                     </div>
                     <div>
                       <h2 className="text-2xl font-black text-foreground">{activeMarket.name}</h2>
                       <p className="text-xs font-medium text-muted-foreground mt-1 max-w-md">
                         {activeMarket.description}
                       </p>
                     </div>
                  </div>
                  
                  {activeMarket.symbol !== '^VIX' && (
                    <Link href={`/app/market/${encodeURIComponent(activeMarket.symbol)}`}>
                      <button className="group flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md">
                        <span>Analyse Complète</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </button>
                    </Link>
                  )}
                </div>

                {/* Body of Active View */}
                <div className="p-6 flex flex-col flex-1 gap-8">
                  
                  {/* Sparkline Section */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tendance Globale ({selectedPeriod})
                    </h3>
                    <div className="h-[200px] w-full rounded-xl border bg-muted/5 p-4 relative">
                      {/* Pass mapped period to Sparkline so graph dynamically scales to selection */}
                      <MarketIndexSparkline 
                        symbol={activeMarket.symbol} 
                        period={selectedPeriod} 
                      />
                    </div>
                  </div>

                  {/* Top / Flop Dynamics */}
                  {activeMarket.symbol !== '^VIX' && (
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Moteurs & Freins ({selectedPeriod})
                        </h3>
                      </div>
                      <div className="flex-1 rounded-xl border bg-muted/10 p-4">
                        <MarketTopFlop symbol={activeMarket.symbol} period={selectedPeriod} />
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </SectionContainer>
    </div>
  )
}
