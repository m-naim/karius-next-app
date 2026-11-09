import Link from 'next/link'
import { CalendarClock, Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EarningsCalendarEvent } from '@/services/earningsCalendarService'

const timingLabels: Record<string, string> = {
  BMO: 'Avant ouverture',
  AMC: 'Après clôture',
  UNKNOWN: 'Horaire inconnu',
}

export function EarningsEventRow({
  event,
  compact = false,
}: {
  event: EarningsCalendarEvent
  compact?: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CalendarClock className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href={`/app/stocks/${encodeURIComponent(event.symbol)}`}
            className="truncate text-sm font-semibold hover:text-primary"
          >
            {event.name || event.symbol}
          </Link>
          <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
            {event.symbol}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {timingLabels[event.time] || event.time}
          </span>
          {!compact &&
            event.contexts.slice(0, 2).map((context) => (
              <span key={`${context.type}-${context.id}`} className="truncate">
                {context.name}
              </span>
            ))}
        </div>
      </div>
      {event.estimated && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] font-medium text-muted-foreground"
        >
          Estimée
        </Badge>
      )}
    </div>
  )
}
