'use client'

import { useSyncExternalStore } from 'react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import { FreshnessInfo, formatFreshnessDate, freshnessState } from '@/lib/data-freshness'

// All indicators share one clock, including tables with hundreds of rows.
let clock = Date.now()
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    clock = Date.now()
    timer = setInterval(() => {
      clock = Date.now()
      listeners.forEach((notify) => notify())
    }, 30_000)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function DataFreshness({
  info,
  calculation = false,
  label,
  className,
  interactive = true,
  compact = false,
}: {
  info?: FreshnessInfo | null
  calculation?: boolean
  interactive?: boolean
  compact?: boolean
  label?: string
  className?: string
}) {
  const now = useSyncExternalStore(
    subscribe,
    () => clock,
    () => 0
  )
  // Avoid server/client date disagreement around midnight or hydration.
  if (!now) return <span className="block min-h-5" />
  const data = info || { sources: [] }
  const { stale, unknown, isStale } = freshnessState(data, now)
  const single = data.sources.length === 1
  const summary = calculation
    ? `Calculé : ${formatFreshnessDate(data.calculatedAt, now)}`
    : single
    ? formatFreshnessDate(data.sources[0].asOf, now) === 'Date inconnue'
      ? 'Date du cours inconnue'
      : formatFreshnessDate(data.sources[0].asOf, now)
    : 'Dates des cours'
  const issue = stale.length
    ? `${stale.length} cours sur ${data.sources.length} antérieur${
        stale.length > 1 ? 's' : ''
      } à aujourd’hui`
    : unknown.length
    ? `${unknown.length} date${unknown.length > 1 ? 's' : ''} de cours inconnue${
        unknown.length > 1 ? 's' : ''
      }`
    : null

  const visible = (
    <>
      {isStale && (
        <span
          aria-hidden="true"
          data-freshness="stale"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"
        />
      )}
      <span className="min-w-0 whitespace-normal">
        {label && <span className="font-medium">{label} · </span>}
        {summary}
        {calculation && data.unknownCalculation && (
          <span className="block">Certaines dates de calcul sont inconnues</span>
        )}
        {issue && (calculation || !single) && <span className="block">{issue}</span>}
        {!compact && !calculation && single && stale.length > 0 && <span> · Cours ancien</span>}
      </span>
    </>
  )
  if (!interactive)
    return (
      <span
        className={cn(
          'flex items-center gap-1.5 text-[10px] font-normal leading-snug text-muted-foreground',
          className
        )}
        title={`${summary}${issue ? ` · ${issue}` : ''} (heure de Paris)`}
      >
        {visible}
      </span>
    )

  return (
    <InfoTooltip
      label={`${label ? `${label} — ` : ''}${summary}${issue ? ` — ${issue}` : ''}`}
      className={cn(
        'max-w-full justify-start gap-1.5 py-0.5 text-left text-[10px] font-normal leading-snug text-muted-foreground md:min-h-5',
        className
      )}
      content={
        <div className="space-y-2 [&_p]:m-0 [&_p]:text-xs [&_p]:font-normal [&_p]:leading-relaxed [&_li]:text-xs [&_li]:font-normal [&_li]:leading-relaxed">
          {label && <p className="font-medium text-foreground">{label}</p>}
          {calculation && <p>Calculé : {formatFreshnessDate(data.calculatedAt, now, true)}</p>}
          {data.upstreamCalculatedAt && (
            <p>Historique calculé : {formatFreshnessDate(data.upstreamCalculatedAt, now, true)}</p>
          )}
          {data.unknownCalculation && <p>Certaines dates de calcul ne sont pas enregistrées.</p>}
          <p className="text-xs text-muted-foreground">
            {isStale
              ? 'Le calcul ou un cours utilisé est antérieur à aujourd’hui, y compris les jours de fermeture des marchés.'
              : 'Dates des données utilisées (heure de Paris).'}
          </p>
          {data.sources.length > 0 && (
            <ul className="max-h-60 space-y-1 overflow-y-auto text-xs">
              {data.sources.map((source, index) => (
                <li
                  key={`${source.symbol}-${index}`}
                  className="flex flex-col gap-0.5 border-b border-border/50 pb-1 last:border-0"
                >
                  <span className="font-medium">{source.symbol}</span>
                  <span>{formatFreshnessDate(source.asOf, now, true)}</span>
                </li>
              ))}
            </ul>
          )}
          {unknown.length > 0 && (
            <p className="text-xs">La fraîcheur des cours sans date ne peut pas être vérifiée.</p>
          )}
        </div>
      }
    >
      {visible}
    </InfoTooltip>
  )
}
