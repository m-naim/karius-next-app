'use client'

import React, { useEffect, useState } from 'react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { MarketPulse } from '@/components/molecules/market/MarketPulse'
import authService from '@/services/authService'
import { getAll as getPortfolios } from '@/services/portfolioService'
import { getAll as getWatchlists } from '@/services/watchListService'
import { PortfolioCard, PortfolioSummery } from './portfolios/portfolioCard'
import { WatchCard } from './watchlist/watchlistCard'
import { WatchListInfos } from './watchlist/page'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Briefcase, ListTodo, GraduationCap, Telescope, Play, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AppDashboard() {
  const [mounted, setMounted] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioSummery[]>([])
  const [watchlists, setWatchlists] = useState<WatchListInfos[]>([])
  const [loading, setLoading] = useState(true)
  
  const user = authService.getCurrentUser()?.user

  useEffect(() => {
    setMounted(true)
    const fetchData = async () => {
      try {
        const [portRes, watchRes] = await Promise.all([
          getPortfolios(),
          getWatchlists()
        ])
        setPortfolios(portRes.ownPortfolios || [])
        setWatchlists(watchRes || [])
      } catch (e) {
        console.error('Failed to fetch dashboard data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (!mounted) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="space-y-12 py-8">
      {/* 1. HERO SECTION : Focus on Learning & Action */}
      <SectionContainer>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
              <Activity className="h-4 w-4" />
              <span>Tableau de bord</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {getGreeting()}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Investisseur'}</span>.
            </h1>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Prêt à développer votre capital et vos connaissances aujourd'hui ?
            </p>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 2. USER WORKSPACES (Highest Priority) */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Portfolios Section */}
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b pb-4">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Briefcase size={18} />
                </div>
                Portefeuilles
              </h2>
              <Link href="/app/portfolios" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
                Gérer
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : portfolios.length > 0 ? (
                portfolios.slice(0, 4).map((p) => (
                  <PortfolioCard key={p.id} {...p} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted bg-muted/20 py-12 text-center transition-colors hover:bg-muted/40">
                  <Briefcase className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-bold text-muted-foreground">Aucun portefeuille</p>
                  <Button asChild size="sm" className="mt-4 rounded-full">
                    <Link href="/app/portfolios/new">Créer un portefeuille</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Watchlists Section */}
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b pb-4">
              <h2 className="flex items-center gap-3 text-xl font-black tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <ListTodo size={18} />
                </div>
                Watchlists
              </h2>
              <Link href="/app/watchlist" className="text-xs font-bold uppercase tracking-wide text-primary hover:underline">
                Gérer
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : watchlists.length > 0 ? (
                watchlists.slice(0, 4).map((w) => (
                  <WatchCard key={w._id} data={w} displayContent={true} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted bg-muted/20 py-12 text-center transition-colors hover:bg-muted/40">
                  <ListTodo className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-bold text-muted-foreground">Aucune liste</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                    <Link href="/app/watchlist/new">Créer une watchlist</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 3. EXPLORATION & LEARNING (Action Cards) */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Learning Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all group-hover:scale-150" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-black">Académie</h2>
                <p className="mt-2 max-w-[80%] text-sm font-medium text-indigo-100">
                  Continuez votre formation. Comprenez les cycles économiques et la psychologie du marché.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm transition-all group-hover:scale-105">
                  <Link href="/app/guide/phase/1" className="flex items-center gap-2">
                    <Play size={16} className="fill-current" />
                    Reprendre la leçon
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Market Exploration Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-background border border-border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/30"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Telescope className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Scanner de Marché</h2>
                <p className="mt-2 max-w-[80%] text-sm font-medium text-muted-foreground">
                  Identifiez les meilleures opportunités. Visualisez les anomalies et les tendances du jour.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild variant="outline" className="rounded-full border-border bg-background shadow-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                  <Link href="/app/market" className="flex items-center gap-2">
                    Explorer maintenant <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionContainer>

      {/* 4. MARKET PULSE */}
      <SectionContainer>
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h3 className="flex items-center gap-2 text-xl font-black tracking-tight">
            Signaux Vitaux
          </h3>
        </div>
        <MarketPulse />
      </SectionContainer>
    </div>
  )
}
