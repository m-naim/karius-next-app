'use client'

import React, { useLayoutEffect } from 'react'
import { WatchlistTable } from './components/watchlistTable'
import { usePathname } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import watchListService from '@/services/watchListService'
import { security } from './data/security'

interface watchList {
  name: string
  securities: security[]
}
export default function Watchlist() {
  const id = usePathname().split('/')[3]
  const [data, setData] = React.useState<watchList>()
  const [loading, setloading] = React.useState(true)
  const fetchData = async () => {
    setData(await watchListService.get(id))
    setloading(false)
  }

  useLayoutEffect(() => {
    fetchData()
  }, [])

  return loading ? (
    <div>loading ...</div>
  ) : (
    <>
      <SectionContainer>
        <div>
          <h1>{data?.name}</h1>
        </div>
      </SectionContainer>
      <SectionContainer>
        <div className="-m-4 flex flex-wrap">
          {!loading && data && <WatchlistTable securities={data.securities} id={id} />}
        </div>
      </SectionContainer>
    </>
  )
}
