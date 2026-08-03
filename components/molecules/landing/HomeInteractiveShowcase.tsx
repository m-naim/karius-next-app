'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { WatchlistDemoMockup } from './WatchlistDemoMockup'
import {
  Eye,
  Wallet,
  TrendingUp,
  SlidersHorizontal,
  PieChart,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function HomeInteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio' | 'risk'>('watchlist')

  return (
    <div className="w-full max-w-6xl mx-auto my-12 space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/50 max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all',
            activeTab === 'watchlist'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Eye className="h-4 w-4" />
          <span>Watchlists &amp; Split-Screen</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all',
            activeTab === 'portfolio'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Wallet className="h-4 w-4" />
          <span>Portefeuilles &amp; Dividendes</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all',
            activeTab === 'risk'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Analyse du Risque</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'watchlist' && (
          <motion.div
            key="watchlist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <WatchlistDemoMockup />
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl mx-auto rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                Tableau de Bord &amp; Suivi Multi-Portefeuilles
              </span>
            </div>
            <div className="relative overflow-hidden bg-background">
              <Image
                className="w-full h-auto object-cover"
                alt="Aperçu du tableau de bord Boursehorus"
                src="/static/images/product/portfolio-page.png"
                width={1200}
                height={650}
                priority
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'risk' && (
          <motion.div
            key="risk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xl font-extrabold text-foreground tracking-tight">
                Analyse Avancée du Risque &amp; Comparaison Benchmarks
              </h4>
              <p className="text-xs text-muted-foreground">
                Calculez vos rendements ajustés au risque et mesurez votre surperformance face aux grands indices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Ratio de Sharpe</span>
                <div className="text-2xl font-black text-emerald-500">1.84</div>
                <p className="text-[10px] text-muted-foreground">Excellente rentabilité pour le risque pris</p>
              </div>

              <div className="p-4 rounded-2xl border bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Volatilité Annuelle</span>
                <div className="text-2xl font-black text-amber-500">12.4%</div>
                <p className="text-[10px] text-muted-foreground">Fluctuation modérée du portefeuille</p>
              </div>

              <div className="p-4 rounded-2xl border bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Max Drawdown</span>
                <div className="text-2xl font-black text-rose-500">-8.2%</div>
                <p className="text-[10px] text-muted-foreground">Perte maximale depuis le sommet</p>
              </div>

              <div className="p-4 rounded-2xl border bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Bêta vs S&amp;P 500</span>
                <div className="text-2xl font-black text-primary">0.91</div>
                <p className="text-[10px] text-muted-foreground">Moins réactif que le marché global</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Benchmark Comparatif</span>
                <p className="text-[11px] text-muted-foreground">S&amp;P 500 (+14.2%) • CAC 40 (+7.8%) • Votre Portefeuille (+21.4%)</p>
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                +7.2% Alpha
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
