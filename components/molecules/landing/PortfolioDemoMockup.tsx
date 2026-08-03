'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Lock,
  Eye,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingBag,
  LineChart,
  BarChart3,
  Calendar,
  X,
  Zap,
  Clock,
  Activity,
  Layers,
  ChevronRight,
  Gem,
  Coins,
  ShieldCheck,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const samplePortfolios = [
  {
    id: 'pea',
    name: '🇫🇷 PEA Growth & Dividendes',
    totalValue: 48250.0,
    dayChangeValue: 642.30,
    dayChangePercent: 1.35,
    cumulativeReturn: 9850.0,
    cumulativePercent: 25.6,
    annualizedReturn: 11.2,
    sharpeRatio: 1.84,
    maxDrawdown: -8.2,
    volatility: 12.4,
    beta: 0.88,
    annualDividends: 1420.50,
    dividendYield: 2.94,
    holdings: [
      { symbol: 'MC.PA', name: 'LVMH', weight: 28.5, qty: 20, bep: 610.0, last: 684.2, totalValue: 13684.0, gain: 1484.0, gainPercent: 12.16, change: 1.45, sector: 'Luxe', color: '#3b82f6', divAmount: 260.0 },
      { symbol: 'AIR.PA', name: 'Airbus SE', weight: 24.2, qty: 80, bep: 128.5, last: 145.8, totalValue: 11664.0, gain: 1384.0, gainPercent: 13.46, change: 2.15, sector: 'Aéronautique', color: '#10b981', divAmount: 224.0 },
      { symbol: 'TTE.PA', name: 'TotalEnergies', weight: 25.8, qty: 200, bep: 54.0, last: 62.4, totalValue: 12480.0, gain: 1680.0, gainPercent: 15.55, change: 0.85, sector: 'Énergie', color: '#f59e0b', divAmount: 632.0 },
      { symbol: 'AI.PA', name: 'Air Liquide', weight: 21.5, qty: 60, bep: 152.0, last: 173.7, totalValue: 10422.0, gain: 1302.0, gainPercent: 14.27, change: 1.10, sector: 'Industrie', color: '#8b5cf6', divAmount: 304.50 },
    ],
    monthlyDividends: [
      { month: 'Jan', amount: 45 },
      { month: 'Fév', amount: 30 },
      { month: 'Mar', amount: 140 },
      { month: 'Avr', amount: 280 },
      { month: 'Mai', amount: 390 },
      { month: 'Juin', amount: 160 },
      { month: 'Juil', amount: 95 },
      { month: 'Août', amount: 20 },
      { month: 'Sep', amount: 110 },
      { month: 'Oct', amount: 40 },
      { month: 'Nov', amount: 60 },
      { month: 'Déc', amount: 50 },
    ],
  },
  {
    id: 'wallstreet',
    name: '🇺🇸 US Tech & Quality',
    totalValue: 84600.0,
    dayChangeValue: 1280.50,
    dayChangePercent: 1.53,
    cumulativeReturn: 22400.0,
    cumulativePercent: 36.0,
    annualizedReturn: 14.8,
    sharpeRatio: 2.12,
    maxDrawdown: -11.4,
    volatility: 16.2,
    beta: 1.15,
    annualDividends: 890.00,
    dividendYield: 1.05,
    holdings: [
      { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 34.0, qty: 224, bep: 85.0, last: 128.45, totalValue: 28772.8, gain: 9732.8, gainPercent: 51.11, change: 4.82, sector: 'SemiCon', color: '#10b981', divAmount: 89.60 },
      { symbol: 'MSFT', name: 'Microsoft', weight: 30.5, qty: 57, bep: 380.0, last: 448.9, totalValue: 25587.3, gain: 3927.3, gainPercent: 18.13, change: 2.34, sector: 'Cloud', color: '#06b6d4', divAmount: 171.00 },
      { symbol: 'AAPL', name: 'Apple Inc', weight: 22.5, qty: 85, bep: 195.0, last: 224.3, totalValue: 19065.5, gain: 2490.5, gainPercent: 15.02, change: 1.15, sector: 'Consumer', color: '#3b82f6', divAmount: 85.00 },
      { symbol: 'AMZN', name: 'Amazon.com', weight: 13.0, qty: 59, bep: 160.0, last: 186.2, totalValue: 10985.8, gain: 1545.8, gainPercent: 16.37, change: 3.12, sector: 'ECom', color: '#ec4899', divAmount: 0.0 },
    ],
    monthlyDividends: [
      { month: 'Jan', amount: 65 },
      { month: 'Fév', amount: 80 },
      { month: 'Mar', amount: 95 },
      { month: 'Avr', amount: 65 },
      { month: 'Mai', amount: 80 },
      { month: 'Juin', amount: 95 },
      { month: 'Juil', amount: 65 },
      { month: 'Août', amount: 80 },
      { month: 'Sep', amount: 95 },
      { month: 'Oct', amount: 65 },
      { month: 'Nov', amount: 80 },
      { month: 'Déc', amount: 95 },
    ],
  },
]

export function PortfolioDemoMockup() {
  const [activePftId, setActivePftId] = useState('pea')
  const [subTab, setSubTab] = useState<'positions' | 'dividends' | 'performance' | 'allocation'>('positions')
  const [isPrivacyMode, setIsPrivacyMode] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<any>(samplePortfolios[0].holdings[0])
  const [showDrawer, setShowDrawer] = useState(true)

  const currentPft = samplePortfolios.find((p) => p.id === activePftId) || samplePortfolios[0]

  const formatEuro = (val: number) => {
    if (isPrivacyMode) return '•••••• €'
    return `${val.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`
  }

  // Calculated max monthly dividend for SVG scaling
  const maxDivMonth = Math.max(...currentPft.monthlyDividends.map((d) => d.amount), 1)

  return (
    <div className="w-full max-w-6xl mx-auto my-12 rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
      {/* Mockup Top Window Bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            Boursehorus — Dashboard Portefeuille Intelligente
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-full border border-border/50 transition-all"
          >
            {isPrivacyMode ? <Lock className="h-3 w-3 text-amber-500" /> : <Eye className="h-3 w-3 text-primary" />}
            <span>{isPrivacyMode ? 'Mode Masqué' : 'Mode Normal'}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            <Zap className="h-3 w-3" /> Suivi Temps Réel
          </div>
        </div>
      </div>

      {/* Portfolio Selector Tabs & Sub-Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border/50 bg-background px-4 py-2 gap-2">
        {/* Left: Portfolios */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {samplePortfolios.map((pft) => (
            <button
              key={pft.id}
              onClick={() => {
                setActivePftId(pft.id)
                setSelectedHolding(pft.holdings[0])
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap',
                activePftId === pft.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{pft.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Sub-Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
          <button
            onClick={() => setSubTab('positions')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              subTab === 'positions'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Positions</span>
          </button>

          <button
            onClick={() => setSubTab('dividends')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              subTab === 'dividends'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Gem className="h-3.5 w-3.5 text-amber-500" />
            <span>Dividendes</span>
          </button>

          <button
            onClick={() => setSubTab('performance')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              subTab === 'performance'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Performance</span>
          </button>

          <button
            onClick={() => setSubTab('allocation')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
              subTab === 'allocation'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PieChart className="h-3.5 w-3.5 text-purple-500" />
            <span>Composition</span>
          </button>
        </div>
      </div>

      {/* PORTFOLIO HEADER STATS CARD */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-background via-muted/20 to-background border-b border-border/50 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Activity className="h-4 w-4" />
            <span>Valeur Globale du Portefeuille</span>
          </div>
          <div className="flex items-baseline gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-foreground tabular-nums">
              {formatEuro(currentPft.totalValue)}
            </h2>
            <div className="flex items-center gap-2">
              {!isPrivacyMode && (
                <span className="text-sm font-bold text-emerald-500 tabular-nums">
                  +{currentPft.dayChangeValue} €
                </span>
              )}
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                +{currentPft.dayChangePercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card border border-border/60 p-3 rounded-2xl shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Plus-Value Totale</span>
            <div className="text-sm font-extrabold text-emerald-500 tabular-nums">
              {formatEuro(currentPft.cumulativeReturn)} (+{currentPft.cumulativePercent}%)
            </div>
          </div>
          <div className="h-8 w-[1px] bg-border/60" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Rendement Annuel</span>
            <div className="text-sm font-extrabold text-foreground tabular-nums">
              +{currentPft.annualizedReturn}% / an
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER ACCORDING TO SUB-TAB */}
      <div className="h-[420px] w-full overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {/* TAB 1: POSITIONS & SPLIT DRAWER */}
          {subTab === 'positions' && (
            <motion.div
              key="positions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full overflow-hidden"
            >
              {/* LEFT PANE: Portfolio Holdings Table */}
              <div className="flex flex-1 min-w-0 flex-col h-full overflow-hidden p-3 gap-3 border-r border-border/40">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-foreground">Positions ({currentPft.holdings.length})</span>
                  <span className="text-[10px] text-muted-foreground italic">Cliquez sur une ligne pour ouvrir le drawer split-screen</span>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-border/60 bg-card">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-muted/80 text-[10px] uppercase font-black tracking-wider text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="p-3">Actif / Secteur</th>
                        <th className="p-3 text-right">Poids (%)</th>
                        <th className="p-3 text-right">Dernier Cours</th>
                        <th className="p-3 text-right hidden sm:table-cell">PRU</th>
                        <th className="p-3 text-right">Plus-Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {currentPft.holdings.map((h) => {
                        const isSelected = selectedHolding?.symbol === h.symbol
                        return (
                          <tr
                            key={h.symbol}
                            onClick={() => {
                              setSelectedHolding(h)
                              if (!showDrawer) setShowDrawer(true)
                            }}
                            className={cn(
                              'cursor-pointer transition-colors hover:bg-accent/40',
                              isSelected && 'bg-primary/10 font-medium border-l-4 border-l-primary'
                            )}
                          >
                            <td className="p-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 font-black text-foreground">
                                  <span>{h.symbol}</span>
                                  <span className="text-[10px] font-normal text-muted-foreground">{h.name}</span>
                                </div>
                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded w-fit mt-0.5">
                                  {h.sector}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold tabular-nums text-foreground">{h.weight}%</td>
                            <td className="p-3 text-right font-bold tabular-nums text-foreground">{h.last} €</td>
                            <td className="p-3 text-right font-semibold text-muted-foreground hidden sm:table-cell">
                              {isPrivacyMode ? '•••' : `${h.bep} €`}
                            </td>
                            <td className="p-3 text-right font-bold tabular-nums">
                              <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <ArrowUpRight className="h-3 w-3" />
                                +{h.gainPercent}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT PANE: SPLIT DRAWER DEMO */}
              <AnimatePresence>
                {showDrawer && selectedHolding && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 330, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex flex-col h-full border-l border-border/60 bg-card p-3 shadow-xl shrink-0 overflow-y-auto space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          {selectedHolding.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-foreground">{selectedHolding.symbol}</h4>
                          <p className="text-[10px] text-muted-foreground">{selectedHolding.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDrawer(false)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg border bg-background space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Cours Actuel</span>
                        <div className="font-extrabold text-foreground">{selectedHolding.last} €</div>
                      </div>
                      <div className="p-2 rounded-lg border bg-background space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">PRU Moyen</span>
                        <div className="font-extrabold text-foreground">{isPrivacyMode ? '•••' : `${selectedHolding.bep} €`}</div>
                      </div>
                      <div className="p-2 rounded-lg border bg-background space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Valeur Totale</span>
                        <div className="font-extrabold text-foreground">{formatEuro(selectedHolding.totalValue)}</div>
                      </div>
                      <div className="p-2 rounded-lg border bg-background space-y-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Retour Global</span>
                        <div className="font-extrabold text-emerald-500">+{selectedHolding.gainPercent}%</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 text-primary" /> Historique de vos Achats
                      </span>
                      <div className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-emerald-500">Achat #1 (Lot Principal)</span>
                          <span className="text-muted-foreground text-[10px]">12/03/2024</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{selectedHolding.qty} actions @ {selectedHolding.bep} €</span>
                          <span className="font-bold text-emerald-500">+{selectedHolding.gainPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 2: DIVIDENDES */}
          {subTab === 'dividends' && (
            <motion.div
              key="dividends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6 flex flex-col h-full space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Dividendes Estimés / an</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatEuro(currentPft.annualDividends)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Projections basées sur l&apos;historique</p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Rendement Moyen (Yield)</span>
                  <div className="text-xl sm:text-2xl font-black text-foreground tabular-nums">{currentPft.dividendYield}%</div>
                  <p className="text-[10px] text-muted-foreground">Sur la valeur actuelle du portefeuille</p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Prochain Versement</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-500 tabular-nums">TotalEnergies</div>
                  <p className="text-[10px] text-muted-foreground">Prévu le 15 Juin (158.00 €)</p>
                </div>
              </div>

              {/* Monthly Dividends Bar Chart Visual */}
              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Calendrier &amp; Répartition Mensuelle des Dividendes</span>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">12 mois</span>
                </div>

                <div className="h-32 w-full flex items-end justify-between gap-1 sm:gap-2 pt-4 border-b border-border/40 pb-2">
                  {currentPft.monthlyDividends.map((m) => {
                    const heightPercent = (m.amount / maxDivMonth) * 100
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-popover text-popover-foreground border text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                          {m.amount} €
                        </div>
                        <div
                          style={{ height: `${Math.max(heightPercent, 10)}%` }}
                          className="w-full rounded-t bg-amber-500/80 group-hover:bg-amber-400 transition-colors"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">{m.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PERFORMANCE & RISQUE */}
          {subTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6 flex flex-col h-full space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Ratio de Sharpe</span>
                  <div className="text-xl font-black text-emerald-500 tabular-nums">{currentPft.sharpeRatio}</div>
                  <p className="text-[9px] text-muted-foreground">Excellente gestion du risque</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Volatilité Annuelle</span>
                  <div className="text-xl font-black text-amber-500 tabular-nums">{currentPft.volatility}%</div>
                  <p className="text-[9px] text-muted-foreground">Fluctuation modérée</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Max Drawdown</span>
                  <div className="text-xl font-black text-rose-500 tabular-nums">{currentPft.maxDrawdown}%</div>
                  <p className="text-[9px] text-muted-foreground">Baisse max enregistrée</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Bêta vs S&amp;P 500</span>
                  <div className="text-xl font-black text-primary tabular-nums">{currentPft.beta}</div>
                  <p className="text-[9px] text-muted-foreground">Sensibilité au marché</p>
                </div>
              </div>

              {/* Equity Curve SVG Chart */}
              <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">Courbe de Performance vs Benchmarks (12 Mois)</span>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="text-emerald-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Votre Portefeuille (+{currentPft.cumulativePercent}%)</span>
                    <span className="text-blue-500 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"/> S&amp;P 500 (+14.2%)</span>
                  </div>
                </div>

                <div className="h-32 w-full relative flex items-end pt-2">
                  <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 50" preserveAspectRatio="none">
                    {/* Benchmark line */}
                    <path d="M0,45 Q20,40 40,30 T70,25 T100,20" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" />
                    {/* Portfolio line */}
                    <path d="M0,45 Q20,35 40,25 T70,15 T100,5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M0,45 Q20,35 40,25 T70,15 T100,5 L100,50 L0,50 Z" fill="currentColor" fillOpacity="0.1" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: COMPOSITION & ALLOCATION (DONUT/PIE CHART) */}
          {subTab === 'allocation' && (
            <motion.div
              key="allocation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 sm:p-6 flex flex-col h-full space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* SVG Donut / Pie Chart */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Circle Segments */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="28.5 71.5" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.8" strokeDasharray="24.2 75.8" strokeDashoffset="-28.5" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray="25.8 74.2" strokeDashoffset="-52.7" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.8" strokeDasharray="21.5 78.5" strokeDashoffset="-78.5" />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Actifs</span>
                      <span className="text-lg font-black text-foreground">{currentPft.holdings.length} Lignes</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">Répartition par Secteurs d&apos;Investissement</span>
                </div>

                {/* Sector Legend List */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-foreground">Détail des Secteurs &amp; Pondérations</span>
                  <div className="space-y-2">
                    {currentPft.holdings.map((h) => (
                      <div key={h.symbol} className="flex items-center justify-between p-2.5 rounded-xl border bg-card text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                          <span className="font-bold text-foreground">{h.sector} ({h.symbol})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-muted-foreground">{formatEuro(h.totalValue)}</span>
                          <span className="font-black text-foreground tabular-nums w-12 text-right">{h.weight}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mockup Footer Caption */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>💡 Naviguez entre <strong>Positions</strong>, <strong>Dividendes</strong>, <strong>Performance</strong> et <strong>Composition</strong></span>
        <span className="font-bold text-primary">Tableau de Bord interactif Boursehorus</span>
      </div>
    </div>
  )
}
