'use client'

import React from 'react'
import { WatchlistTable } from './watchlistTable'

export default function Projects() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="container py-12">
          <div className="-m-4 flex flex-wrap">
            <WatchlistTable />
          </div>
        </div>
      </div>
    </>
  )
}
