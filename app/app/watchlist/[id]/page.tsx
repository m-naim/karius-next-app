'use client'

import React from 'react'
import { WatchlistTable } from './watchlistTable'
import { usePathname } from 'next/navigation'

export default function Watchlist() {
  const id = usePathname().split('/')[3]
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div>
          <h1>Titre</h1>
          <p>description</p>
        </div>
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            <WatchlistTable id={id} />
          </div>
        </div>
      </div>
    </>
  )
}
