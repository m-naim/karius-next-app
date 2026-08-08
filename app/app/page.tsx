'use client'

import React, { useEffect, useState } from 'react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { MarketPulse } from '@/components/molecules/market/MarketPulse'
import authService from '@/services/authService'
import { getAll as getPortfolios } from '@/services/portfolioService'
import { getAll as getWatchlists } from '@/services/watchListService'
import { PortfolioCard, PortfolioSummery } from './portfolios/PortfolioCard'
import { WatchCard } from './watchlist/watchlistCard'
import { WatchListInfos } from './watchlist/page'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  ListTodo,
  GraduationCap,
  Telescope,
  Play,
  Activity,
  AlertCircle,
  Plus,
  Bell,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Wallet,
  Compass,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AppDashboard() {
  const [mounted, setMounted] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioSummery[]>([])
  const [watchlists, setWatchlists] = useState<WatchListInfos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = authService.getCurrentUser()?.user

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [portRes, watchRes] = await Promise.all([
        getPortfolios(),
        getWatchlists(),
      ])
      setPortfolios(portRes.ownPortfolios || [])
      setWatchlists(watchRes || [])
    } catch (e: any) {
      console.error('Failed to fetch dashboard data', e)
      setError(e.message || 'Impossible de charger les données. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  if (!mounted) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  // Calculate cumulative capital and average daily performance
  const totalCapital = portfolios.reduce((sum, p) => sum + (p.totalValue || (p as any).totalValue || 0), 0)
  const averageDayChange = portfolios.length > 0
    ? portfolios.reduce((sum, p) => sum + (p.dayChangePercent || 0), 0) / portfolios.length
    : 0
  const isPositiveDaily = averageDayChange >= 0

  return (
    <div className="space-y-8 py-6">
      {/* 1. HERO SECTION & TOTAL WEALTH SUMMARY */}
      <SectionContainer>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Activity className="h-4 w-4" />
              <span>Tableau de Bord Financier</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {getGreeting()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Investisseur'}</span>.
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Voici l'état global de vos investissements et vos opportunités du jour.
            </p>
          </motion.div>

          {/* TOTAL WEALTH CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 shadow-xl backdrop-blur-md min-w-[280px] sm:min-w-[340px]"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Wallet className="h-3.5 w-3.5 text-primary" /> Capital Total Cumulé
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {portfolios.length} Portefeuille{portfolios.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {loading ? (
                  <Skeleton className="h-9 w-36 rounded-lg" />
                ) : (
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalCapital)
                )}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  isPositiveDaily
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {isPositiveDaily ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>
                  {isPositiveDaily ? '+' : ''}
                  {averageDayChange.toFixed(2)} %
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">moyenne du jour</span>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 2. QUICK ACTIONS BAR */}
      <SectionContainer>
        <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Button asChild size="sm" className="rounded-full gap-2 shrink-0 shadow-sm">
            <Link href="/app/portfolios/new">
              <Plus className="h-4 w-4" /> Nouveau Portefeuille
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full gap-2 shrink-0 border-border/80 bg-card hover:bg-accent">
            <Link href="/app/alerts">
              <Bell className="h-4 w-4 text-amber-500" /> Alertes Prix
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full gap-2 shrink-0 border-border/80 bg-card hover:bg-accent">
            <Link href="/app/super-investors">
              <Users className="h-4 w-4 text-indigo-500" /> Super Investisseurs
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full gap-2 shrink-0 border-border/80 bg-card hover:bg-accent">
            <Link href="/app/market">
              <Telescope className="h-4 w-4 text-blue-500" /> Scanner de Marché
            </Link>
          </Button>
        </div>
      </SectionContainer>

      {/* 3. USER WORKSPACES (Portfolios & Watchlists) */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Portfolios Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="flex items-center gap-2.5 text-lg font-black tracking-tight">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Briefcase size={16} />
                </div>
                Portefeuilles d'Investissement
              </h2>
              <Link href="/app/portfolios" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                Voir Tout ({portfolios.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : error ? (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/25 bg-destructive/5 py-8 text-center px-4">
                  <AlertCircle className="mb-2 h-6 w-6 text-destructive" />
                  <p className="text-xs font-medium text-muted-foreground">{error}</p>
                  <Button onClick={fetchData} variant="outline" size="sm" className="mt-3 rounded-full">
                    Réessayer
                  </Button>
                </div>
              ) : portfolios.length > 0 ? (
                portfolios.slice(0, 4).map((p) => (
                  <PortfolioCard key={p.id} {...p} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 py-10 text-center transition-colors hover:bg-muted/20">
                  <Briefcase className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-bold text-muted-foreground">Aucun portefeuille configuré</p>
                  <Button asChild size="sm" className="mt-4 rounded-full">
                    <Link href="/app/portfolios/new">Créer un portefeuille</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Watchlists Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="flex items-center gap-2.5 text-lg font-black tracking-tight">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <ListTodo size={16} />
                </div>
                Watchlists Suivies
              </h2>
              <Link href="/app/watchlist" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                Voir Tout ({watchlists.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : error ? (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/25 bg-destructive/5 py-8 text-center px-4">
                  <AlertCircle className="mb-2 h-6 w-6 text-destructive" />
                  <p className="text-xs font-medium text-muted-foreground">{error}</p>
                  <Button onClick={fetchData} variant="outline" size="sm" className="mt-3 rounded-full">
                    Réessayer
                  </Button>
                </div>
              ) : watchlists.length > 0 ? (
                watchlists.slice(0, 4).map((w, index) => (
                  <WatchCard key={w._id || w.id || index} data={w} displayContent={true} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 py-10 text-center transition-colors hover:bg-muted/20">
                  <ListTodo className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-bold text-muted-foreground">Aucune liste créée</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                    <Link href="/app/watchlist/new">Créer une watchlist</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 4. FEATURED BANNER : SUPER INVESTORS (13F Tracker) */}
      <SectionContainer>
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-xl backdrop-blur-md">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Suivi 13F SEC EDGAR</span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold text-primary">15 Gérants d'Élite</span>
                </div>
                <h3 className="text-xl font-black text-foreground">Portefeuilles des Super Investisseurs</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                  Découvrez où investissent François Rochon, Warren Buffett, Sir Chris Hohn et Terry Smith. Analysez leurs plus fortes convictions en temps réel.
                </p>
              </div>
            </div>
            <Button asChild className="rounded-full shrink-0 gap-2 shadow-md hover:scale-105 transition-transform">
              <Link href="/app/super-investors">
                Explorer les Portefeuilles <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* 5. EXPLORATION & ACADEMY */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Learning Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-black">Académie Bourse Horus</h2>
                <p className="mt-2 max-w-[85%] text-xs font-medium text-indigo-100 leading-relaxed">
                  Perfectionnez vos stratégies d'investissement. Comprenez l'allocation de capital et les modèles de valorisation.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild className="rounded-full bg-white text-indigo-700 hover:bg-white/90 font-bold shadow-md transition-all group-hover:scale-105">
                  <Link href="/fr/guide" className="flex items-center gap-2">
                    <Play size={15} className="fill-current" />
                    Explorer les Guides
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Market Exploration Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/15" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Telescope className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Scanner de Marché</h2>
                <p className="mt-2 max-w-[85%] text-xs font-medium text-muted-foreground leading-relaxed">
                  Filtrez les actions selon les critères d'évaluation des maîtres de la valeur. Découvrez les opportunités du jour.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild variant="outline" className="rounded-full border-border/80 bg-background font-bold shadow-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                  <Link href="/app/market" className="flex items-center gap-2">
                    Lancer le Scanner <ArrowRight size={15} />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 6. MARKET PULSE */}
      <SectionContainer>
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Activity className="h-4 w-4 text-primary" />
            Signaux Vitaux du Marché
          </h3>
        </div>
        <MarketPulse />
      </SectionContainer>
    </div>
  )
}
