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
import { ArrowRight, LayoutDashboard, Briefcase, ListTodo, TrendingUp } from 'lucide-react'
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
        // getPortfolios returns { ownPortfolios, ... }
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

  return (
    <div className="space-y-10 py-6">
      {/* Welcome & Pulse */}
      <SectionContainer>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Ravi de vous revoir, <span className="text-primary">{user?.name || 'Investisseur'}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Voici l'état actuel de vos investissements et du marché.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/app/profile" className="flex items-center gap-2">
                Mon Profil <ArrowRight size={14} />
              </Link>
            </Button>
          </motion.div>
        </div>

        <MarketPulse />
      </SectionContainer>

      {/* Main Grid */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          
          {/* Portfolios Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Briefcase className="text-primary" size={20} />
                Mes Portefeuilles
              </h2>
              <Link href="/app/portfolios" className="text-xs font-bold text-primary hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : portfolios.length > 0 ? (
                portfolios.slice(0, 2).map((p) => (
                  <PortfolioCard key={p.id} {...p} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm text-gray-500">Vous n'avez pas encore de portefeuille.</p>
                  <Button asChild size="sm" className="mt-4 rounded-full">
                    <Link href="/app/portfolios/new">Créer mon premier portefeuille</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Watchlists Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <ListTodo className="text-primary" size={20} />
                Mes Watchlists
              </h2>
              <Link href="/app/watchlist" className="text-xs font-bold text-primary hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : watchlists.length > 0 ? (
                watchlists.slice(0, 2).map((w) => (
                  <WatchCard key={w._id} data={w} displayContent={true} />
                ))
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm text-gray-500">Aucune watchlist active.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                    <Link href="/app/watchlist/new">Ajouter une watchlist</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Market Trends Section */}
      <SectionContainer>
        <div className="rounded-3xl bg-gray-900 p-8 text-white shadow-2xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <TrendingUp size={24} className="text-primary" />
                Exploration de Marché
              </h2>
              <p className="max-w-md text-sm text-gray-400">
                Ne manquez aucune opportunité. Découvrez les indices mondiaux et les actions les plus performantes du moment.
              </p>
            </div>
            <Button asChild className="rounded-full px-8 py-6 text-lg font-bold">
              <Link href="/app/market">
                Explorer le Marché <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </div>
  )
}
