'use client'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface WatchlistNavigationProps {
  prevId?: string
  nextId?: string
}

export function WatchlistNavigation({ prevId, nextId }: WatchlistNavigationProps) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/app/watchlist/${prevId}`} passHref>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!prevId}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Watchlist</span>
        </Button>
      </Link>
      <Link href={`/app/watchlist/${nextId}`} passHref>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!nextId}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Watchlist</span>
        </Button>
      </Link>
    </div>
  )
}
