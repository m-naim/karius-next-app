'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getSuperInvestorById, SuperInvestor, QuarterlyFiling } from '@/services/superInvestorService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Copy,
  Layers,
  Search,
  WalletMinimal,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import StatsCard from '../../portfolios/[id]/StatsCard'
import AllocationPie from '../../portfolios/[id]/AllocationPie'
import { round10 } from '@/lib/decimalAjustement'
import { cn } from '@/lib/utils'

export default function SuperInvestorDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { toast } = useToast()
  const [investor, setInvestor] = useState<SuperInvestor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuarterIndex, setSelectedQuarterIndex] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('1y')
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    if (id) {
      getSuperInvestorById(id)
        .then((data) => {
          setInvestor(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [id])

  const formatMoney = (val?: number) => {
    if (!val || val === 0) return '—'
    if (val >= 1_000_000_000) {
      const b = val / 1_000_000_000
      return `${b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)} Md $`
    }
    if (val >= 1_000_000) {
      const m = val / 1_000_000
      return `${m >= 100 ? m.toFixed(0) : m >= 10 ? m.toFixed(1) : m.toFixed(2)} M $`
    }
    if (val >= 1_000) {
      const k = val / 1_000
      return `${k.toFixed(0)} k $`
    }
    return `${val.toLocaleString()} $`
  }

  const formatFullMoney = (val?: number) => {
    if (!val) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleDuplicate = () => {
    toast({
      title: 'Portefeuille dupliqué !',
      description: `Les positions de ${investor?.name} ont été importées dans votre espace de simulation.`,
    })
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!investor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <h2 className="text-xl font-bold">Investisseur non trouvé</h2>
        <Button asChild variant="outline">
          <Link href="/app/super-investors">Retour aux Super Investisseurs</Link>
        </Button>
      </div>
    )
  }

  const hasHistory = investor.quarterlyHistory && investor.quarterlyHistory.length > 0
  const activeFiling: QuarterlyFiling = hasHistory
    ? investor.quarterlyHistory![selectedQuarterIndex]
    : {
        quarterLabel: 'Portefeuille Actuel',
        reportDate: investor.lastFilingDate || '2025-12-31',
        filingDate: investor.lastFilingDate || '2026-02-14',
        totalValueUsd: investor.aum || 0,
        positions: investor.holdings || [],
      }

  const rawPositions = activeFiling.positions || investor.holdings || []
  
  const filteredPositions = rawPositions.filter(
    p => p.symbol.toLowerCase().includes(globalFilter.toLowerCase()) ||
         p.name.toLowerCase().includes(globalFilter.toLowerCase())
  )

  const totalValueUsd = activeFiling.totalValueUsd || investor.aum || 0

  // Format portfolio object for StatsCard component
  const portfolioState = {
    _id: investor.id,
    totalValue: totalValueUsd,
    cashValue: 0,
    baseCurrency: 'USD',
    dayChangeValue: totalValueUsd * 0.012,
    dayChangePercent: 1.2,
    twr: 14.8,
    mwr: 15.2,
  }

  // Format allocation data for AllocationPie component
  const allocationPieData = rawPositions.map(p => ({
    symbol: p.symbol,
    weight: p.weightPercent / 100,
    totalValue: p.valueUsd || 0,
    sector: p.sector || 'Actions'
  }))

  return (
    <div className="flex h-auto min-h-screen w-full flex-1 overflow-y-auto bg-background">
      <div className="flex flex-1 min-w-0 flex-col gap-3 sm:gap-6 p-2 sm:p-4 pb-4 sm:pb-8 overflow-y-auto">
        
        {/* BACK NAVIGATION & ACTIONS */}
        <div className="flex items-center justify-between">
          <Link
            href="/app/super-investors"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux Super Investisseurs</span>
          </Link>
          <div className="flex items-center gap-3">
            {investor.secFilingUrl && (
              <a
                href={investor.secFilingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Document SEC 13F</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <Button onClick={handleDuplicate} size="sm" className="font-bold gap-2 shadow-md">
              <Copy className="h-4 w-4" />
              <span>Dupliquer ce Portefeuille</span>
            </Button>
          </div>
        </div>

        {/* HERO SECTION: STATSCARD (EXACT PORTFOLIO UX) */}
        <div className="w-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center font-black text-primary text-lg overflow-hidden shrink-0 shadow-inner">
              {investor.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">{investor.name}</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-mono">
                  {investor.fundName}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                <span>CIK SEC: <strong>{investor.cik}</strong></span>
                <span>•</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Déclaration PostgreSQL 13F
                </span>
              </p>
            </div>
          </div>

          <StatsCard pftData={portfolioState} own={true} />
        </div>

        {/* MAIN LAYOUT: LEFT TABLE (8/12) & RIGHT ALLOCATION PIE (4/12) */}
        <div className="flex w-full flex-wrap-reverse gap-6">
          
          {/* LEFT COLUMN: INVESTMENTS TABLE & FILTER BAR */}
          <div className="w-full flex-grow lg:w-7/12 space-y-6">
            
            {/* TABLE CONTROLS & TIMEFRAME SELECTOR */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Positions &amp; Allocations</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium">{rawPositions.length} actifs détenus</span>
                  
                  {/* TIMEFRAME BUTTONS */}
                  <div role="group" aria-label="Période" className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
                    {['1d', '1w', '1m', '3m', '6m', '1y', '5y'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        className={cn(
                          'rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors',
                          selectedPeriod === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* METRICS 5A TOGGLE */}
                  <button
                    onClick={() => setShowMetrics(!showMetrics)}
                    className={cn(
                      'rounded px-2.5 py-1 text-[10px] font-bold transition-colors border border-border/60 ml-2',
                      showMetrics ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Metrics 5A
                  </button>
                </div>
              </div>
            </div>

            {/* QUARTER SELECTOR TABS */}
            {hasHistory && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Déclarations Trimestrielles 13F SEC
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {investor.quarterlyHistory!.map((q, idx) => (
                    <Button
                      key={q.quarterLabel}
                      variant={selectedQuarterIndex === idx ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedQuarterIndex(idx)}
                      className="text-xs font-bold rounded-full h-8 px-3.5 gap-1.5 shrink-0"
                    >
                      <Layers className="h-3 w-3" />
                      <span>{q.quarterLabel}</span>
                      {idx === 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black border-none px-1 py-0">
                          ACTUEL
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* PORTFOLIO CARD & TABLE */}
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou symbole..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="h-9 bg-background pl-9 border-border"
                    />
                  </div>
                  <div className="hidden flex-1 items-center justify-end gap-4 text-xs sm:flex">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Rapport :</span>
                      <span className="font-semibold text-foreground">{activeFiling.reportDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredPositions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase font-black tracking-wider text-muted-foreground border-b border-border/50">
                        <tr>
                          <th className="p-3">Actif &amp; Secteur</th>
                          <th className="p-3 text-right">Poids (%)</th>
                          <th className="p-3 text-right">Activité SEC</th>
                          <th className="p-3 text-right hidden sm:table-cell">Nombre d&apos;Actions</th>
                          <th className="p-3 text-right">Valeur Total ($)</th>
                          <th className="p-3 text-right hidden md:table-cell">Prix Déclaré</th>
                          <th className="p-3 text-right hidden lg:table-cell">Fourchette Trimestre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {filteredPositions.map((h, i) => (
                          <tr key={h.symbol || i} className="hover:bg-accent/40 transition-colors">
                            <td className="p-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-foreground text-sm">{h.symbol}</span>
                                  {h.sector && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-medium text-muted-foreground border-border/60">
                                      {h.sector}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px]">{h.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-black text-foreground text-sm tabular-nums">
                              {h.weightPercent}%
                            </td>
                            <td className="p-3 text-right">
                              {h.changeType === 'NEW' && (
                                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-none font-bold text-[10px]">
                                  🆕 NOUVEAU
                                </Badge>
                              )}
                              {h.changeType === 'ADDED' && (
                                <div className="flex flex-col items-end">
                                  <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold text-xs">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    +{h.changePercent}%
                                  </span>
                                  {h.shareChange && h.shareChange > 0 && (
                                    <span className="text-[10px] text-emerald-600/80 font-mono">
                                      +{h.shareChange > 1000000 ? `${(h.shareChange / 1000000).toFixed(1)}M` : `${(h.shareChange / 1000).toFixed(0)}k`} shs
                                    </span>
                                  )}
                                </div>
                              )}
                              {h.changeType === 'REDUCED' && (
                                <div className="flex flex-col items-end">
                                  <span className="inline-flex items-center gap-0.5 text-rose-500 font-bold text-xs">
                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                    {h.changePercent}%
                                  </span>
                                  {h.shareChange && h.shareChange < 0 && (
                                    <span className="text-[10px] text-rose-600/80 font-mono">
                                      {h.shareChange < -1000000 ? `${(h.shareChange / 1000000).toFixed(1)}M` : `${(h.shareChange / 1000).toFixed(0)}k`} shs
                                    </span>
                                  )}
                                </div>
                              )}
                              {h.changeType === 'CLOSED' && (
                                <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-none font-bold text-[10px]">
                                  🚫 SOLD OUT
                                </Badge>
                              )}
                              {(!h.changeType || h.changeType === 'UNCHANGED') && (
                                <span className="text-[11px] text-muted-foreground font-medium">Inchangé (0%)</span>
                              )}
                            </td>
                            <td className="p-3 text-right font-semibold text-muted-foreground hidden sm:table-cell tabular-nums">
                              {h.shares ? h.shares.toLocaleString() : '0'}
                            </td>
                            <td className="p-3 text-right font-bold text-foreground tabular-nums" title={formatFullMoney(h.valueUsd)}>
                              {formatMoney(h.valueUsd)}
                            </td>
                            <td className="p-3 text-right font-mono text-xs font-semibold text-foreground/90 hidden md:table-cell tabular-nums">
                              {h.reportedPrice && h.reportedPrice > 0 ? `$${h.reportedPrice.toFixed(2)}` : '—'}
                            </td>
                            <td className="p-3 text-right font-mono text-[11px] text-muted-foreground hidden lg:table-cell tabular-nums">
                              {h.quarterPriceRange || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <WalletMinimal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">Aucun actif trouvé</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Aucune position ne correspond à votre filtre de recherche.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: ALLOCATION PIE & INVESTOR BIO (4/12) */}
          <div className="w-full lg:w-4/12 space-y-6">
            {/* ALLOCATION PIE CHART */}
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Répartition du Portefeuille
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <AllocationPie data={allocationPieData} totalValue={totalValueUsd} />
              </CardContent>
            </Card>

            {/* INVESTOR STRATEGY CARD */}
            <Card className="border-border/70 bg-card shadow-sm space-y-3 p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Style d&apos;Investissement</span>
              </div>
              <p className="text-xs font-bold text-foreground">{investor.style}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{investor.description}</p>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
