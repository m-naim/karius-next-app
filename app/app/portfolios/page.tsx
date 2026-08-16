'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Briefcase,
  Flame,
  Star,
  Users,
  ArrowRight,
  TrendingUp,
  Globe,
  Sparkles,
  PieChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { PortfolioCard, PortfolioSummery } from './PortfolioCard'
import authService from '@/services/authService'
import { getAll } from '@/services/portfolioService'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PortfoliosPresentation {
  ownPortfolios: PortfolioSummery[]
  bestPerformingPortfolios: PortfolioSummery[]
  mostFollowedPortfolios: PortfolioSummery[]
}

export default function PortfoliosHubPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my')
  const [data, setData] = useState<PortfoliosPresentation | null>(null)
  const [loading, setLoading] = useState(true)

  const { authentificated } = authService.getCurrentUser()

  useEffect(() => {
    setMounted(true)
    let isMounted = true

    getAll()
      .then((res) => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Failed to load portfolios:', err)
        if (isMounted) setLoading(false)
      })

    if (!authentificated) {
      setActiveTab('explore')
    }

    return () => {
      isMounted = false
    }
  }, [authentificated])

  if (!mounted) {
    return (
      <div className="space-y-6 py-6 max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const ownList = data?.ownPortfolios || []
  const bestList = data?.bestPerformingPortfolios || []
  const followedList = data?.mostFollowedPortfolios || []

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl mx-auto w-full px-3 md:px-6">
      {/* 1. Header Unifié avec CTA & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Gestion de <span className="text-primary">Portefeuilles</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">
              <Sparkles className="h-2.5 w-2.5" /> Performance
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Suivez vos actifs, analysez vos plus-values et comparez vos résultats avec les meilleurs investisseurs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/app/portfolios/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto gap-1.5 font-bold shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Créer un portefeuille</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Onglets de Navigation Fluide */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          {authentificated && (
            <button
              onClick={() => setActiveTab('my')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                activeTab === 'my'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Mes Portefeuilles ({loading ? '...' : ownList.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('explore')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'explore'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Inspiration Communautaire</span>
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {activeTab === 'my'
            ? 'Vos portefeuilles d’investissement actifs'
            : 'Explorez et suivez les stratégies les plus performantes'}
        </span>
      </div>

      {/* 3. Contenu de l'onglet actif */}
      {activeTab === 'my' ? (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : ownList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Aucun portefeuille créé</h3>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Ajoutez vos comptes PEA, Compte-Titres ou Crypto pour suivre votre performance globale, vos dividendes et votre allocation sectorielle.
              </p>
              <div className="mt-5">
                <Link href="/app/portfolios/new">
                  <Button size="sm" className="gap-1.5 font-bold">
                    <Plus className="h-4 w-4" />
                    <span>Créer mon premier portefeuille</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ownList.map((p) => (
                <PortfolioCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Les Plus Performants */}
              <Card className="border-border/60 bg-card/40 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between px-5 pb-3 pt-5">
                  <CardTitle className="flex items-center gap-2.5 text-sm font-bold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                      <Flame className="h-4 w-4" fill="currentColor" />
                    </div>
                    <span>Les plus performants</span>
                  </CardTitle>
                  <Link
                    href="/app/portfolios/explore"
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Explorer tout <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <CommunityList items={bestList} />
                </CardContent>
              </Card>

              {/* Les Plus Suivis */}
              <Card className="border-border/60 bg-card/40 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between px-5 pb-3 pt-5">
                  <CardTitle className="flex items-center gap-2.5 text-sm font-bold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <Star className="h-4 w-4" fill="currentColor" />
                    </div>
                    <span>Les plus suivis</span>
                  </CardTitle>
                  <Link
                    href="/app/portfolios/explore"
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Explorer tout <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardHeader>
                <CardContent className="px-3 pb-4">
                  <CommunityList items={followedList} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CommunityList({ items }: { items: PortfolioSummery[] }) {
  if (!items?.length) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-muted-foreground italic">
        Aucune donnée disponible pour le moment
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((p, index) => (
        <Link
          key={p.id}
          href={`/app/portfolios/${p.id}`}
          className="group flex items-center justify-between rounded-xl p-2.5 transition-all hover:bg-accent/60 hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center text-xs font-black text-muted-foreground/50 group-hover:text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {p.name}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                <Users className="h-2.5 w-2.5" />
                {p.followersSize || 0} abonnés
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Annualisé</span>
              <VariationContainer
                value={p.annualizedReturn}
                entity="%"
                background={false}
                className="p-0 text-xs font-black"
              />
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
