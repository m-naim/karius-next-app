'use client'
import authService from '@/services/authService'
import { getAll } from '@/services/watchListService'
import React, { useEffect } from 'react'
import { WatchCard } from './watchlistCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { WatchListInfos } from './page'
import { LineChart, ChevronRight } from 'lucide-react'

export function MyWatchLists() {
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<WatchListInfos[]>([])
  const { authentificated } = authService.getCurrentUser()

  const fetchData = async () => {
    try {
      const res = await getAll()
      setData(res)
    } catch (e) {
      console.error('error api:', e)
    }
  }

  React.useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  if (!mounted) return null

  return authentificated && data ? (
    <SectionContainer className="space-y-6">
      <div className="flex w-full flex-col items-center px-4 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
          Mes Watchlists
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gérez et analysez vos listes de suivi personnelles
        </p>
        <div className="mt-4">
          <Link data-umami-event="portfolios-new-button" href={'/app/watchlist/new'}>
            <Button data-umami-event="portfolios-new-button" variant={'default'} size={'sm'}>
              + Ajouter une watchlist
            </Button>
          </Link>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <LineChart className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Aucune watchlist</h3>
          <p className="mb-6 mt-2 max-w-md text-sm text-muted-foreground">
            Les watchlists vous permettent de regrouper et suivre les valeurs qui vous intéressent, comparer leurs performances et recevoir des alertes.
          </p>
          <Link href={'/app/watchlist/new'}>
            <Button>Créer ma première watchlist</Button>
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 mt-8">
          {data.map((w, index) => (
            <Link
              key={w._id || w.id || index}
              href={`/app/watchlist/${w._id || w.id}`}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <span className="text-sm font-bold text-primary">
                    {(w.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{w.name}</h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    {w.securities?.length || 0} valeur{(w.securities?.length || 0) > 1 ? 's' : ''} surveillée{(w.securities?.length || 0) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition-colors group-hover:bg-background">
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionContainer>
  ) : null
}
