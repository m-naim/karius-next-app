'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  BarChart2,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap,
  Eye,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sampleWatchlists = [
  {
    id: 'tech',
    name: '🚀 Megacaps & IA (US)',
    count: 5,
    stocks: [
      { symbol: 'NVDA', name: 'NVIDIA Corp', price: '128.45 $', change: 4.82, pe: '42.1x', roic: '38.4%', tags: ['#IA', '#SemiCon'] },
      { symbol: 'AAPL', name: 'Apple Inc', price: '224.30 $', change: 1.15, pe: '31.2x', roic: '54.2%', tags: ['#Tech', '#Consumer'] },
      { symbol: 'MSFT', name: 'Microsoft', price: '448.90 $', change: 2.34, pe: '35.6x', roic: '28.9%', tags: ['#Cloud', '#IA'] },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: '182.60 $', change: -0.85, pe: '24.1x', roic: '22.5%', tags: ['#Search', '#AdTech'] },
      { symbol: 'AMZN', name: 'Amazon.com', price: '186.20 $', change: 3.12, pe: '41.0x', roic: '16.8%', tags: ['#ECom', '#AWS'] },
    ],
  },
  {
    id: 'dividends',
    name: '💰 Aristocrates du Dividende',
    count: 4,
    stocks: [
      { symbol: 'MC.PA', name: 'LVMH Moët Hennessy', price: '684.20 €', change: 1.45, pe: '23.4x', roic: '19.2%', tags: ['#Luxe', '#CAC40'] },
      { symbol: 'OR.PA', name: "L'Oréal S.A.", price: '392.50 €', change: 0.82, pe: '32.1x', roic: '18.5%', tags: ['#Cosmétique'] },
      { symbol: 'SAN.PA', name: 'Sanofi S.A.', price: '94.30 €', change: -0.42, pe: '14.8x', roic: '12.1%', tags: ['#Santé', '#Dividende'] },
      { symbol: 'TTE.PA', name: 'TotalEnergies SE', price: '62.40 €', change: 2.18, pe: '7.9x', roic: '15.4%', tags: ['#Énergie', '#Rendement'] },
    ],
  },
  {
    id: 'quality',
    name: '🛡️ Quality Growth Europe',
    count: 4,
    stocks: [
      { symbol: 'ASML', name: 'ASML Holding', price: '862.00 €', change: 3.85, pe: '44.2x', roic: '48.1%', tags: ['#SemiCon', '#EUV'] },
      { symbol: 'NOVO-B', name: 'Novo Nordisk', price: '924.50 DKK', change: 2.76, pe: '38.9x', roic: '62.0%', tags: ['#Pharma', '#Obésité'] },
      { symbol: 'SAP', name: 'SAP SE', price: '198.40 €', change: 1.92, pe: '36.5x', roic: '14.2%', tags: ['#SaaS', '#Cloud'] },
      { symbol: 'RMS.PA', name: 'Hermès International', price: '2,140.00 €', change: 0.95, pe: '48.6x', roic: '29.4%', tags: ['#Luxe', '#UltraHigh'] },
    ],
  },
]

export function WatchlistDemoMockup() {
  const [activeListId, setActiveListId] = useState('tech')
  const [selectedStock, setSelectedStock] = useState<any>(sampleWatchlists[0].stocks[0])
  const [showDrawer, setShowDrawer] = useState(true)
  const [activeScreener, setActiveScreener] = useState<string | null>(null)

  const currentList = sampleWatchlists.find((l) => l.id === activeListId) || sampleWatchlists[0]

  const filteredStocks = currentList.stocks.filter((s) => {
    if (activeScreener === 'garp') return parseFloat(s.pe) < 35
    if (activeScreener === 'roic') return parseFloat(s.roic) > 25
    if (activeScreener === 'gain') return s.change > 2.0
    return true
  })

  return (
    <div className="w-full max-w-6xl mx-auto my-12 rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
      {/* Mockup Top Window Bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            Boursehorus — Watchlists &amp; Suivi d&apos;Actions
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
          <Zap className="h-3 w-3" /> Démo Interactive Split-Screen
        </div>
      </div>

      {/* Watchlist Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/50 bg-background/80 px-4 py-2">
        {sampleWatchlists.map((wl) => (
          <button
            key={wl.id}
            onClick={() => {
              setActiveListId(wl.id)
              setSelectedStock(wl.stocks[0])
            }}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap',
              activeListId === wl.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>{wl.name}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                activeListId === wl.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {wl.count}
            </span>
          </button>
        ))}
      </div>

      {/* MAIN SPLIT-SCREEN CONTAINER */}
      <div className="flex h-[460px] w-full overflow-hidden bg-background">
        {/* LEFT PANE: Table & Screeners */}
        <div className="flex flex-1 min-w-0 flex-col h-full overflow-hidden p-3 gap-3 border-r border-border/40">
          {/* Screener & Filter Bar */}
          <div className="flex items-center justify-between gap-2 shrink-0 bg-muted/20 p-2 rounded-xl border border-border/40">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" /> Filtres Rapides:
              </span>
              <button
                onClick={() => setActiveScreener(activeScreener === 'roic' ? null : 'roic')}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all border',
                  activeScreener === 'roic'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                🔥 ROIC &gt; 25%
              </button>
              <button
                onClick={() => setActiveScreener(activeScreener === 'garp' ? null : 'garp')}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all border',
                  activeScreener === 'garp'
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                🏷️ PE &lt; 35x
              </button>
              <button
                onClick={() => setActiveScreener(activeScreener === 'gain' ? null : 'gain')}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all border',
                  activeScreener === 'gain'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground'
                )}
              >
                📈 Hausses &gt; 2%
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-border/60 bg-card">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 bg-muted/80 text-[10px] uppercase font-black tracking-wider text-muted-foreground backdrop-blur">
                <tr>
                  <th className="p-3">Valeur / Tags</th>
                  <th className="p-3 text-right">Dernier Cours</th>
                  <th className="p-3 text-right">Variation 1j</th>
                  <th className="p-3 text-right hidden sm:table-cell">PER (5a)</th>
                  <th className="p-3 text-right hidden sm:table-cell">ROIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredStocks.map((stock) => {
                  const isSelected = selectedStock?.symbol === stock.symbol
                  const isPositive = stock.change >= 0
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock)
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
                            <span>{stock.symbol}</span>
                            <span className="text-[10px] font-normal text-muted-foreground truncate max-w-[120px]">
                              {stock.name}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {stock.tags.map((t) => (
                              <span key={t} className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-foreground">{stock.price}</td>
                      <td className="p-3 text-right font-bold tabular-nums">
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-black',
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          )}
                        >
                          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {isPositive ? '+' : ''}
                          {stock.change}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-muted-foreground hidden sm:table-cell">{stock.pe}</td>
                      <td className="p-3 text-right font-semibold text-emerald-500 hidden sm:table-cell">{stock.roic}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANE: SPLIT DRAWER DEMO */}
        <AnimatePresence>
          {showDrawer && selectedStock && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col h-full border-l border-border/60 bg-card p-3 shadow-xl shrink-0 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                    {selectedStock.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-foreground">{selectedStock.symbol}</h4>
                    <p className="text-[10px] text-muted-foreground">{selectedStock.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Simulated Chart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground">Graphique Technique (1 an)</span>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +24.8% (12M)
                  </span>
                </div>

                {/* SVG Mockup Chart */}
                <div className="h-32 w-full rounded-xl bg-background border border-border/40 p-2 relative flex items-end">
                  <svg className="w-full h-full text-primary" viewBox="0 0 100 50" preserveAspectRatio="none">
                    <path
                      d="M0,40 Q15,30 30,35 T60,20 T80,25 T100,5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M0,40 Q15,30 30,35 T60,20 T80,25 T100,5 L100,50 L0,50 Z"
                      fill="currentColor"
                      fillOpacity="0.1"
                    />
                  </svg>
                </div>

                {/* Fundamentals Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg border bg-background space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">P/E Ratio</span>
                    <div className="font-black text-foreground">{selectedStock.pe}</div>
                  </div>
                  <div className="p-2 rounded-lg border bg-background space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">ROIC (Capitaux)</span>
                    <div className="font-black text-emerald-500">{selectedStock.roic}</div>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Thèses &amp; Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedStock.tags.map((t: string) => (
                      <span key={t} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground border border-dashed border-border px-2 py-0.5 rounded-full">
                      + Ajouter tag
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mockup Footer Caption */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>👈 Cliquez sur une action pour tester le drawer split-screen interactif en direct</span>
        <span className="font-bold text-primary">Cotations &amp; données en temps réel</span>
      </div>
    </div>
  )
}
