'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addDays, format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EarningsCalendarEvent,
  getEarningsCalendar,
} from '@/services/earningsCalendarService'

const timingLabels: Record<string, string> = {
  BMO: 'Avant séance',
  AMC: 'Après séance',
  UNKNOWN: 'Horaire inconnu',
}

export function UpcomingEarnings() {
  const [events, setEvents] = useState<EarningsCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const today = new Date()
    setLoading(true)
    setError(false)
    getEarningsCalendar(
      format(today, 'yyyy-MM-dd'),
      format(addDays(today, 14), 'yyyy-MM-dd'),
      'all',
      { signal: controller.signal }
    )
      .then((data) => {
        if (controller.signal.aborted) return
        const unique = new Map(
          data.map((event) => [`${event.symbol}-${event.date}`, event])
        )
        setEvents(
          [...unique.values()].sort(
            (a, b) =>
              a.date.localeCompare(b.date) || a.symbol.localeCompare(b.symbol)
          )
        )
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [version])

  return (
    <section
      aria-labelledby="upcoming-earnings"
      className="border-t border-border pt-4"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2
          id="upcoming-earnings"
          className="m-0 p-0 text-base font-bold text-foreground"
        >
          Publications · 14 jours
        </h2>
        <Link
          href="/app/calendar"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Calendrier
        </Link>
      </div>
      {loading ? (
        <Skeleton className="h-20 rounded-md" />
      ) : error ? (
        <div className="flex items-center justify-between gap-3 py-3 text-sm">
          <p className="m-0 text-muted-foreground">
            Publications indisponibles.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVersion((current) => current + 1)}
          >
            Réessayer
          </Button>
        </div>
      ) : events.length ? (
        <ul className="m-0 divide-y divide-border/60 p-0">
          {events.map((event) => (
            <li
              key={`${event.symbol}-${event.date}`}
              className="flex items-center gap-3 py-2 text-xs"
            >
              <time
                dateTime={event.date}
                className="w-12 shrink-0 font-semibold tabular-nums"
              >
                {new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                }).format(new Date(`${event.date}T12:00:00`))}
              </time>
              <Link
                href={`/app/stocks/${encodeURIComponent(event.symbol)}`}
                title={event.name}
                className="min-w-0 flex-1 truncate font-semibold hover:text-primary"
              >
                {event.name || event.symbol}
              </Link>
              <span className="shrink-0 text-right text-[10px] text-muted-foreground">
                {timingLabels[event.time] || 'Horaire inconnu'}
                {event.estimated && <span className="block">Date estimée</span>}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-3 text-sm text-muted-foreground">
          Aucune publication connue pour vos actions dans les 14 prochains
          jours.
        </p>
      )}
    </section>
  )
}
