import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { getPublicWatchlists } from '@/services/actions'
import React from 'react'
import { WatchCard } from './watchlistCard'
import { MyWatchLists } from './myWatchlist'

export interface WatchListInfos {
  _id: string
  name: string
  securities: { symbol: string }[]
  createdAt: string
  updatedAt: string
}

export default async function watchlistPage() {
  const listWatch = await getPublicWatchlists()

  return (
    <div className="space-y-12 py-8">
      <MyWatchLists />

      <SectionContainer className="space-y-6">
        <div className="flex w-full flex-col items-center px-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
            Découvrez les meilleurs portefeuilles de la communauté
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            Explorez et suivez les portefeuilles qui vous inspirent
          </p>
        </div>
        <div className="grid w-full grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listWatch.map((w) => (
            <WatchCard key={w._id.toString()} data={w} />
          ))}
        </div>
      </SectionContainer>
    </div>
  )
}
