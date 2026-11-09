'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  RefreshCw,
} from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EarningsEventRow } from '@/components/earnings/EarningsEventRow'
import {
  EarningsCalendarEvent,
  EarningsScope,
  getEarningsCalendar,
} from '@/services/earningsCalendarService'
import { cn } from '@/lib/utils'

type ViewMode = 'agenda' | 'month'

const scopeOptions: Array<{ value: EarningsScope; label: string }> = [
  { value: 'all', label: 'Tout' },
  { value: 'portfolio', label: 'Portefeuilles' },
  { value: 'watchlist', label: 'Watchlists' },
]

export default function EarningsCalendarPage() {
  const [events, setEvents] = useState<EarningsCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [scope, setScope] = useState<EarningsScope>('all')
  const [view, setView] = useState<ViewMode>('agenda')
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const from = format(new Date(), 'yyyy-MM-dd')
    const to = format(addDays(new Date(), 90), 'yyyy-MM-dd')
    getEarningsCalendar(from, to, scope, { signal: controller.signal })
      .then(setEvents)
      .catch((requestError) => {
        if (requestError?.name !== 'AbortError') setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [scope, reloadKey])

  const grouped = useMemo(() => {
    return events.reduce<Record<string, EarningsCalendarEvent[]>>(
      (acc, event) => {
        ;(acc[event.date] ||= []).push(event)
        return acc
      },
      {}
    )
  }, [events])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  return (
    <SectionContainer className="py-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Calendrier financier
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Résultats à venir
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Toutes les publications attendues pour les actions de vos
              portefeuilles et watchlists. Les dates non confirmées par
              l’émetteur sont signalées comme estimées.
            </p>
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Affichage du calendrier"
          >
            <div className="flex rounded-lg border border-border p-1">
              <Button
                size="sm"
                variant={view === 'agenda' ? 'secondary' : 'ghost'}
                onClick={() => setView('agenda')}
                className="h-7 gap-1.5 px-2.5 text-xs"
              >
                <List className="h-3.5 w-3.5" /> Agenda
              </Button>
              <Button
                size="sm"
                variant={view === 'month' ? 'secondary' : 'ghost'}
                onClick={() => setView('month')}
                className="hidden h-7 gap-1.5 px-2.5 text-xs sm:flex"
              >
                <CalendarDays className="h-3.5 w-3.5" /> Mois
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex rounded-lg bg-muted p-1"
            aria-label="Périmètre des actions"
          >
            {scopeOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={scope === option.value ? 'secondary' : 'ghost'}
                onClick={() => setScope(option.value)}
                className="h-7 px-3 text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {events.length} publication{events.length > 1 ? 's' : ''} sur 90
            jours
          </p>
        </div>

        {loading ? (
          <CalendarSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center border-y border-border py-16 text-center">
            <AlertCircle className="mb-3 h-7 w-7 text-destructive" />
            <h2 className="font-semibold">
              Calendrier temporairement indisponible
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              La synchronisation des dates n’a pas pu être chargée.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Réessayer
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-y border-border py-16 text-center">
            <CalendarDays className="mb-3 h-8 w-8 text-muted-foreground/60" />
            <h2 className="font-semibold">Aucune publication connue</h2>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Aucune date future n’est actuellement disponible pour les actions
              de ce périmètre. La synchronisation continuera automatiquement.
            </p>
          </div>
        ) : view === 'agenda' ? (
          <div className="divide-y divide-border/70 border-y border-border/70">
            {Object.entries(grouped).map(([date, dayEvents]) => (
              <section
                key={date}
                className="grid gap-2 py-4 sm:grid-cols-[150px_1fr] sm:gap-6"
              >
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {format(parseISO(date), 'EEEE d MMMM', { locale: fr })}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {dayEvents.length} publication
                    {dayEvents.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="divide-y divide-border/60">
                  {dayEvents.map((event) => (
                    <EarningsEventRow
                      key={`${event.symbol}-${event.date}`}
                      event={event}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth(subMonths(month, 1))}
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-semibold capitalize">
                {format(month, 'MMMM yyyy', { locale: fr })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth(addMonths(month, 1))}
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-[11px] font-medium text-muted-foreground">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const dayEvents = grouped[key] || []
                return (
                  <div
                    key={key}
                    className={cn(
                      'min-h-24 border-b border-r border-border/70 p-2',
                      !isSameMonth(day, month) &&
                        'bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="text-xs font-medium">
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.symbol}
                          className="truncate rounded bg-primary/10 px-1.5 py-1 text-[10px] font-semibold text-primary"
                          title={`${event.name} — ${
                            event.estimated ? 'date estimée' : 'date confirmée'
                          }`}
                        >
                          {event.symbol}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4 border-y border-border py-5">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid gap-3 sm:grid-cols-[150px_1fr]">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}
