'use client'

import { useSyncExternalStore } from 'react'
import { Clock3 } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import {
  FreshnessInfo,
  combinedFreshness,
  formatFreshnessDate,
  formatSourceFreshnessDate,
  freshnessState,
} from '@/lib/data-freshness'

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

type FreshnessSection = { label: string; info?: FreshnessInfo | null }

export function DataFreshness({
  info,
  calculation = false,
  label,
  className,
  interactive = true,
  display = 'icon',
  sections,
}: {
  info?: FreshnessInfo | null
  calculation?: boolean
  interactive?: boolean
  compact?: boolean
  display?: 'icon' | 'status' | 'date'
  sections?: FreshnessSection[]
  label?: string
  className?: string
}) {
  const now = useSyncExternalStore(
    subscribe,
    () => clock,
    () => 0
  )
  if (!now) return <span className="inline-block h-6 w-6 shrink-0 align-middle" />
  const data = sections
    ? combinedFreshness(sections.map((section) => section.info || { sources: [] }))
    : info || { sources: [] }
  const { stale, unknown, isStale } = freshnessState(data, now)
  const dated = data.sources.length === 1 ? formatSourceFreshnessDate(data.sources[0], now) : null
  const status = isStale
    ? 'Données anciennes'
    : unknown.length
    ? 'Dates à préciser'
    : 'Dates des données'
  const totalCount = new Set(data.sources.map((source) => source.symbol)).size
  const staleCount = new Set(stale.map((source) => source.symbol)).size
  const issue = staleCount
    ? `${staleCount} cours sur ${totalCount} antérieur${staleCount > 1 ? 's' : ''} à aujourd’hui`
    : null
  const accessibleLabel = `${label ? `${label} — ` : ''}${status}${issue ? ` — ${issue}` : ''}${
    dated ? ` — ${dated}` : ''
  }`
  const visible = (
    <>
      {isStale ? (
        <span
          aria-hidden="true"
          data-freshness="stale"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"
        />
      ) : (
        <Clock3 aria-hidden="true" className="h-3 w-3 shrink-0" />
      )}
      {display === 'status' && isStale && <span>Données anciennes</span>}
      {display === 'date' && <span>{dated || formatFreshnessDate(data.calculatedAt, now)}</span>}
    </>
  )

  const details = (value: FreshnessInfo, showCalculation: boolean) => (
    <>
      {(showCalculation || value.calculatedAt != null) && (
        <p>Calculé : {formatFreshnessDate(value.calculatedAt, now, true)}</p>
      )}
      {value.upstreamCalculatedAt && (
        <p>Historique calculé : {formatFreshnessDate(value.upstreamCalculatedAt, now, true)}</p>
      )}
      {value.unknownCalculation && (
        <p className="text-muted-foreground">Certaines dates de calcul ne sont pas renseignées.</p>
      )}
      {value.sources.length > 0 && (
        <ul className="space-y-2">
          {value.sources.map((source, index) => (
            <li key={`${source.symbol}-${index}`} className="space-y-0.5">
              <span className="block font-medium">
                {source.symbol}
                {source.label && ` · ${source.label}`}
              </span>
              <span className="block text-muted-foreground">
                {formatSourceFreshnessDate(source, now, true)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!value.sources.length && value.calculatedAt == null && (
        <p className="text-muted-foreground">Date non renseignée.</p>
      )}
    </>
  )

  if (!interactive)
    return (
      <span
        className={cn(
          'inline-flex h-6 items-center gap-1.5 text-[10px] font-normal text-muted-foreground',
          className
        )}
        title={`${accessibleLabel}${
          data.calculatedAt
            ? ` · Calculé : ${formatFreshnessDate(data.calculatedAt, now, true)}`
            : ''
        }`}
      >
        {visible}
      </span>
    )

  return (
    <InfoTooltip
      label={accessibleLabel}
      className={cn(
        'h-6 min-h-6 min-w-6 gap-1.5 px-1 text-[10px] font-normal leading-snug text-muted-foreground md:min-h-6 md:min-w-6',
        className
      )}
      content={
        <div className="max-h-80 space-y-3 overflow-y-auto [&_p]:m-0 [&_p]:text-xs [&_p]:font-normal [&_p]:leading-relaxed [&_li]:text-xs [&_li]:font-normal [&_li]:leading-relaxed">
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {label || (calculation ? 'Dates du calcul' : 'Dates des données')}
            </p>
            {issue && <p className="text-muted-foreground">{issue}</p>}
          </div>
          {sections
            ? sections.map((section) => (
                <div key={section.label} className="space-y-2 border-t border-border/60 pt-2">
                  <p className="font-medium text-foreground">{section.label}</p>
                  {details(section.info || { sources: [] }, true)}
                </div>
              ))
            : details(data, calculation)}
        </div>
      }
    >
      {visible}
    </InfoTooltip>
  )
}
