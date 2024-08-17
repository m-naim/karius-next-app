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

  useEffect(() => {
    fetchData()
  }, [])
  return authentificated && data ? (
    <SectionContainer>
      <div className="flex w-full place-content-between py-6">
        <h2 className="border-b-2 border-primary">Mes watchlists</h2>
        <Link data-umami-event="portfolios-new-button" href={'watchlist/new'}>
          <Button data-umami-event="portfolios-new-button" variant={'outline'} size={'sm'}>
            + Ajouter une watchlist
          </Button>
        </Link>
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fill,20rem)] justify-center gap-6 overflow-auto">
        {data.map((w) => (
          <WatchCard key={w._id} data={w} displayContent={false} />
        ))}
      </div>
    </SectionContainer>
  ) : null
}
