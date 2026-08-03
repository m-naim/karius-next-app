'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSuperInvestors, SuperInvestor } from '@/services/superInvestorService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Sparkles,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Building2,
  PieChart,
  ArrowRight,
  UserCheck,
} from 'lucide-react'

export default function SuperInvestorsAppPage() {
  const [investors, setInvestors] = useState<SuperInvestor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  useEffect(() => {
    getSuperInvestors()
      .then((data) => {
        setInvestors(data)
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

    if (selectedFilter === 'QUALITY') {
      return matchesSearch && (inv.style.toLowerCase().includes('quality') || inv.style.toLowerCase().includes('compound'))
    }
    if (selectedFilter === 'MONOPOLY') {
      return matchesSearch && (inv.style.toLowerCase().includes('monopole') || inv.style.toLowerCase().includes('stool'))
    }
    return matchesSearch
  })

  return (
    <div className="flex w-full min-h-screen flex-1 flex-col overflow-y-auto bg-background">
      <div className="flex flex-1 min-w-0 flex-col gap-6 p-4 md:p-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-bold gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Portefeuilles 13F SEC Officiels
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Super Investisseurs &amp; Quality Compounders
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Suivez en direct les positions et stratégies des plus grands gérants de portefeuille mondiaux.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Chercher un investisseur ou une action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-card border-border"
            />
          </div>
        </div>

        {/* FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('ALL')}
            className="text-xs font-bold rounded-full h-8"
          >
            Tous les Gérants ({investors.length})
          </Button>
          <Button
            variant={selectedFilter === 'QUALITY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('QUALITY')}
            className="text-xs font-bold rounded-full h-8 gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Quality &amp; Compounders
          </Button>
          <Button
            variant={selectedFilter === 'MONOPOLY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('MONOPOLY')}
            className="text-xs font-bold rounded-full h-8 gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
            Monopoles &amp; Pricing Power
          </Button>
        </div>

        {/* INVESTORS GRID */}
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
                    {/* Strategy Badge */}
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      <span>{inv.style}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {inv.description}
                    </p>

                    {/* Notable Holdings Tags */}
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

                  {/* Actions */}
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
    </div>
  )
}
