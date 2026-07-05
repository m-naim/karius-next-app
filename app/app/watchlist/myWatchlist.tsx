'use client'
import authService from '@/services/authService'
import { getAll } from '@/services/watchListService'
import React, { useEffect } from 'react'
import { WatchCard } from './watchlistCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { WatchListInfos } from './page'

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
      <div className="grid w-full grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((w, index) => (
          <WatchCard key={w._id || w.id || index} data={w} displayContent={false} />
        ))}
      </div>
    </SectionContainer>
  ) : null
}
