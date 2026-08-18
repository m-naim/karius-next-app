'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getSuperInvestors,
  getConsensusReport,
  SuperInvestor,
  ConsensusReport,
  ConsensusStock,
} from '@/services/superInvestorService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building2,
  PieChart,
  ArrowRight,
  Users,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react'

export default function SuperInvestorsAppPage() {
  const [investors, setInvestors] = useState<SuperInvestor[]>([])
  const [consensus, setConsensus] = useState<ConsensusReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'INVESTORS' | 'MOST_OWNED' | 'TOP_BUYS' | 'TOP_SELLS'>('INVESTORS')
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([getSuperInvestors(), getConsensusReport()])
      .then(([invData, consensusData]) => {
        setInvestors(invData)
        setConsensus(consensusData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredInvestors = investors.filter((inv) => {
    const matchesSearch =
      inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.fundName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.notableHoldings.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedStyleFilter === 'QUALITY') {
      return matchesSearch && (inv.style.toLowerCase().includes('quality') || inv.style.toLowerCase().includes('compound'))
    }
    if (selectedStyleFilter === 'MONOPOLY') {
      return matchesSearch && (inv.style.toLowerCase().includes('monopole') || inv.style.toLowerCase().includes('stool'))
    }
    return matchesSearch
  })

  const filterConsensusList = (list: ConsensusStock[] | undefined) => {
    if (!list) return []
    return list.filter(
      (s) =>
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.holders.some((h) => h.investorName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const formatMoney = (val?: number) => {
    if (!val || isNaN(val)) return '$0'
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`
    return `$${val.toFixed(0)}`
  }

  return (
    <div className="flex w-full min-h-screen flex-1 flex-col overflow-y-auto bg-background">
      <div className="flex flex-1 min-w-0 flex-col gap-6 p-4 md:p-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Portefeuilles 13F SEC &amp; Consensus Dataroma
              </Badge>
              {consensus?.latestQuarter && (
                <Badge variant="secondary" className="text-xs font-mono">
                  {consensus.latestQuarter}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Super Investisseurs &amp; Grand Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Suivez en direct les positions, arbitrages trimestriels et consensus d&apos;achats des plus grands gérants de portefeuille.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Chercher une action ou un gérant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-card border-border"
            />
          </div>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border/60 pb-3">
          <Button
            variant={activeTab === 'INVESTORS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('INVESTORS')}
            className="text-xs font-bold rounded-full h-8 gap-1.5 shrink-0"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Tous les Gérants ({investors.length})</span>
          </Button>

          <Button
            variant={activeTab === 'MOST_OWNED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('MOST_OWNED')}
            className="text-xs font-bold rounded-full h-8 gap-1.5 shrink-0"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Grand Portfolio (Top Détenues)</span>
            {consensus?.mostOwned && (
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black border-none px-1.5 py-0">
                {consensus.mostOwned.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === 'TOP_BUYS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('TOP_BUYS')}
            className="text-xs font-bold rounded-full h-8 gap-1.5 shrink-0"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Top Achats du Trimestre</span>
            {consensus?.topBuys && (
              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border-none px-1.5 py-0">
                {consensus.topBuys.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === 'TOP_SELLS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('TOP_SELLS')}
            className="text-xs font-bold rounded-full h-8 gap-1.5 shrink-0"
          >
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Top Ventes du Trimestre</span>
            {consensus?.topSells && (
              <Badge className="bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black border-none px-1.5 py-0">
                {consensus.topSells.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* TAB 1: INVESTORS GRID */}
        {activeTab === 'INVESTORS' && (
          <div className="space-y-6">
            {/* SUB-FILTER PILLS FOR INVESTORS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button
                variant={selectedStyleFilter === 'ALL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStyleFilter('ALL')}
                className="text-xs font-semibold rounded-md h-7"
              >
                Tous les styles
              </Button>
              <Button
                variant={selectedStyleFilter === 'QUALITY' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStyleFilter('QUALITY')}
                className="text-xs font-semibold rounded-md h-7 gap-1"
              >
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Quality &amp; Compounders
              </Button>
              <Button
                variant={selectedStyleFilter === 'MONOPOLY' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStyleFilter('MONOPOLY')}
                className="text-xs font-semibold rounded-md h-7 gap-1"
              >
                <ShieldCheck className="h-3 w-3 text-purple-500" />
                Monopoles &amp; Pricing Power
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvestors.map((inv) => (
                  <Card
                    key={inv.id}
                    className="group flex flex-col justify-between overflow-hidden border-border/70 bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <CardHeader className="p-5 pb-3 border-b border-border/40 bg-muted/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-base overflow-hidden shrink-0">
                            {inv.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {inv.name}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <span>{inv.fundName}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                          CIK: {inv.cik}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                          <span>{inv.style}</span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {inv.description}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Principales Lignes :
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {inv.notableHoldings.map((h) => (
                              <span
                                key={h}
                                className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground border border-border/50"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                        <Button asChild size="sm" className="w-full font-bold gap-2 group-hover:bg-primary">
                          <Link href={`/app/super-investors/${inv.id}`}>
                            <span>Consulter le Portefeuille</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2, 3, 4: CONSENSUS TABLES */}
        {activeTab !== 'INVESTORS' && (
          <div className="space-y-6">
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/30 px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                      {activeTab === 'MOST_OWNED' && (
                        <>
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span>Grand Portfolio — Les Valeurs les Plus Détenues</span>
                        </>
                      )}
                      {activeTab === 'TOP_BUYS' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span>Top Achats &amp; Accumulations du Trimestre</span>
                        </>
                      )}
                      {activeTab === 'TOP_SELLS' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                          <span>Top Ventes &amp; Allègements du Trimestre</span>
                        </>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Analyse consolidée sur l&apos;ensemble des {consensus?.totalInvestorsAnalyzed || 0} Super Investisseurs ({consensus?.latestQuarter || '13F'}).
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase font-black tracking-wider text-muted-foreground border-b border-border/50">
                        <tr>
                          <th className="p-3.5">Rang &amp; Actif</th>
                          <th className="p-3.5 text-center">Gérants Détenteurs</th>
                          <th className="p-3.5 text-right">Poids Moyen</th>
                          <th className="p-3.5 text-right">Valeur Cumulée ($)</th>
                          <th className="p-3.5">Gérants &amp; Activité Récente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {filterConsensusList(
                          activeTab === 'MOST_OWNED'
                            ? consensus?.mostOwned
                            : activeTab === 'TOP_BUYS'
                            ? consensus?.topBuys
                            : consensus?.topSells
                        ).map((s, idx) => (
                          <tr key={s.symbol} className="hover:bg-accent/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <span className="font-black text-muted-foreground/80 text-xs w-4">#{idx + 1}</span>
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-black text-foreground text-sm">{s.symbol}</span>
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-medium text-muted-foreground border-border/60">
                                      {s.sector}
                                    </Badge>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[200px]">{s.name}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-center">
                              <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-xs px-2 py-0.5">
                                {s.investorCount} {s.investorCount > 1 ? 'gérants' : 'gérant'}
                              </Badge>
                            </td>

                            <td className="p-3.5 text-right font-black text-foreground text-sm tabular-nums">
                              {s.averageWeightPercent}%
                            </td>

                            <td className="p-3.5 text-right font-bold text-foreground tabular-nums">
                              {formatMoney(s.totalValueUsd)}
                            </td>

                            <td className="p-3.5">
                              <div className="flex flex-wrap gap-1.5">
                                {s.holders.map((h) => (
                                  <Link
                                    key={h.investorId}
                                    href={`/app/super-investors/${h.investorId}`}
                                    className="inline-flex items-center gap-1 rounded-md bg-muted/80 hover:bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground border border-border/50 transition-colors"
                                  >
                                    <span>{h.investorName}</span>
                                    <span className="text-muted-foreground text-[10px]">({h.weightPercent}%)</span>
                                    {h.changeType === 'NEW' && (
                                      <span className="text-[9px] font-black text-purple-600 dark:text-purple-400">NEW</span>
                                    )}
                                    {h.changeType === 'ADDED' && (
                                      <span className="text-[9px] font-bold text-emerald-500">+{h.changePercent}%</span>
                                    )}
                                    {h.changeType === 'REDUCED' && (
                                      <span className="text-[9px] font-bold text-rose-500">{h.changePercent}%</span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
