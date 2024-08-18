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
    <>
      <MyWatchLists />

      <SectionContainer>
        <div className="my-12 flex w-full place-content-center text-center ">
          <h1 className="text-3xl">Découvrez les meilleurs portefeuilles de la communauté</h1>
        </div>
        <div className="grid w-full grid-cols-[repeat(auto-fill,20rem)] justify-center gap-2 overflow-auto">
          {listWatch.map((w) => (
            <WatchCard key={w._id.toString()} data={w} />
          ))}
        </div>
      </SectionContainer>
    </>
  )
}
