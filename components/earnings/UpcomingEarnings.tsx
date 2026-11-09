'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EarningsEventRow } from './EarningsEventRow'
import {
  EarningsCalendarEvent,
  getEarningsCalendar,
} from '@/services/earningsCalendarService'

export function UpcomingEarnings() {
  const [events, setEvents] = useState<EarningsCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const today = new Date()
    getEarningsCalendar(
      format(today, 'yyyy-MM-dd'),
      format(addDays(today, 14), 'yyyy-MM-dd'),
      'all',
      {
        signal: controller.signal,
      }
    )
      .then((data) => setEvents(data.slice(0, 5)))
      .catch((error) => {
        if (error?.name !== 'AbortError') setEvents([])
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return (
    <div className="border-y border-border/70 py-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
            Prochains résultats
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Publications attendues dans les 14 prochains jours
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 text-xs"
        >
          <Link href="/app/calendar">
            Calendrier <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : events.length ? (
        <div className="divide-y divide-border/60 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
          {events.map((event) => (
            <EarningsEventRow
              key={`${event.symbol}-${event.date}`}
              event={event}
              compact
            />
          ))}
        </div>
      ) : (
        <p className="py-3 text-sm text-muted-foreground">
          Aucune publication connue dans les deux prochaines semaines.
        </p>
      )}
    </div>
  )
}
