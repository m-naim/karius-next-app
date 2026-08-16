'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Bookmark, Globe, Sparkles, Eye, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { WatchCard } from './watchlistCard'
import watchListService from '@/services/watchListService'
import authService from '@/services/authService'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface WatchListInfos {
  _id?: string
  id?: string
  name: string
  is_public?: boolean
  isPublic?: boolean
  securities?: { symbol: string; date?: string }[]
  createdAt?: string
  updatedAt?: string
}

export default function WatchlistHubPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my')
  const [myWatchlists, setMyWatchlists] = useState<WatchListInfos[]>([])
  const [publicWatchlists, setPublicWatchlists] = useState<WatchListInfos[]>([])
  const [loadingMy, setLoadingMy] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)

  const { authentificated } = authService.getCurrentUser()

  useEffect(() => {
    setMounted(true)
    let isMounted = true

    // Fetch user watchlists if logged in
    if (authentificated) {
      watchListService
        .getAll()
        .then((res) => {
          if (isMounted) {
            setMyWatchlists(Array.isArray(res) ? res : [])
            setLoadingMy(false)
          }
        })
        .catch(() => {
          if (isMounted) setLoadingMy(false)
        })
    } else {
      setLoadingMy(false)
      setActiveTab('public')
    }

    // Fetch public community watchlists
    watchListService
      .getPublic()
      .then((res) => {
        if (isMounted) {
          setPublicWatchlists(Array.isArray(res) ? res : [])
          setLoadingPublic(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoadingPublic(false)
      })

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
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl mx-auto w-full px-3 md:px-6">
      {/* 1. Header Unifié avec CTA & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Mes Listes &amp; <span className="text-primary">Watchlists</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">
              <Sparkles className="h-2.5 w-2.5" /> Suivi
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Suivez vos valeurs favorites, recevez des alertes et découvrez les listes de la communauté.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/app/watchlist/new" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto gap-1.5 font-bold shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Créer une watchlist</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Onglets de Navigation Fluide (Mes Listes vs Communauté) */}
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
              <Bookmark className="h-3.5 w-3.5" />
              <span>Mes Listes ({loadingMy ? '...' : myWatchlists.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('public')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              activeTab === 'public'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Communauté &amp; Découverte ({loadingPublic ? '...' : publicWatchlists.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {activeTab === 'my'
            ? 'Vos listes personnelles sauvegardées'
            : 'Listes publiques partagées par les membres'}
        </span>
      </div>

      {/* 3. Contenu de l'onglet Actif */}
      {activeTab === 'my' ? (
        <div>
          {loadingMy ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : myWatchlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Bookmark className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Aucune watchlist créée</h3>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Regroupez vos actions préférées par secteur, stratégie ou niveau de valorisation pour suivre leurs performances au quotidien.
              </p>
              <div className="mt-5">
                <Link href="/app/watchlist/new">
                  <Button size="sm" className="gap-1.5 font-bold">
                    <Plus className="h-4 w-4" />
                    <span>Créer ma première watchlist</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myWatchlists.map((w, index) => (
                <WatchCard key={w._id || w.id || index} data={w} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {loadingPublic ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : publicWatchlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
              <p className="text-xs text-muted-foreground">
                Aucune watchlist publique n'est disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publicWatchlists.map((w, index) => (
                <WatchCard key={w._id || w.id || index} data={w} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
