export type DateInput = string | number | Date | null | undefined
export const FRESHNESS_TIME_ZONE = 'Europe/Paris'

export interface FreshnessSource {
  symbol: string
  label?: string
  asOf?: DateInput
  updatedAt?: DateInput
}

export interface FreshnessInfo {
  upstreamCalculatedAt?: DateInput
  unknownCalculation?: boolean
  calculatedAt?: DateInput
  sources: FreshnessSource[]
}

export interface DatedSecurity {
  symbol?: string
  quoteAsOf?: DateInput
  valuationAsOf?: DateInput
  variationsAsOf?: DateInput
  variationsCalculatedAt?: DateInput
  lastUpdated?: DateInput
  valuationUpdatedAt?: DateInput
}

export function calendarDate(value: DateInput): string | null {
  if (value == null || value === '') return null
  // API dates without an offset represent calendar dates in Europe/Paris.
  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}(?:$|[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$)/.test(value)
  ) {
    const key = value.slice(0, 10)
    const parsed = new Date(`${key}T12:00:00Z`)
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === key
      ? key
      : null
  }
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FRESHNESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function freshnessState(info: FreshnessInfo, now: DateInput = new Date()) {
  const today = calendarDate(now)!
  const stale = info.sources.filter((source) => {
    const date = calendarDate(sourceFreshnessDate(source))
    return date != null && date < today
  })
  const unknown = info.sources.filter((source) => calendarDate(sourceFreshnessDate(source)) == null)
  const calculatedDate = calendarDate(info.calculatedAt)
  return {
    stale,
    unknown,
    isStale:
      stale.length > 0 ||
      (calculatedDate != null && calculatedDate < today) ||
      (calendarDate(info.upstreamCalculatedAt) != null &&
        calendarDate(info.upstreamCalculatedAt)! < today),
  }
}

export function sourceFreshnessDate(source: FreshnessSource): DateInput {
  return calendarDate(source.asOf) ? source.asOf : source.updatedAt
}

export function formatSourceFreshnessDate(
  source: FreshnessSource,
  now: DateInput,
  full = false
): string {
  if (calendarDate(source.asOf)) return formatFreshnessDate(source.asOf, now, full)
  if (calendarDate(source.updatedAt))
    return `Données mises à jour : ${formatFreshnessDate(source.updatedAt, now, full)}`
  return 'Date du cours inconnue'
}

export function formatFreshnessDate(
  value: DateInput,
  now: DateInput = new Date(),
  full = false
): string {
  const key = calendarDate(value)
  if (!key) return 'Date inconnue'
  const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  const naive = typeof value === 'string' && /^[\d-]+[ T][\d:.]+$/.test(value)
  const date = new Date(dateOnly || naive ? `${key}T12:00:00Z` : value!)
  const day =
    !full && key === calendarDate(now)
      ? 'Aujourd’hui'
      : new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: full ? 'long' : 'short',
          year: full || key.slice(0, 4) !== calendarDate(now)?.slice(0, 4) ? 'numeric' : undefined,
          timeZone: FRESHNESS_TIME_ZONE,
        }).format(date)
  if (dateOnly) return day
  const time = naive
    ? String(value).slice(11, 16)
    : new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: FRESHNESS_TIME_ZONE,
      }).format(date)
  return `${day} à ${time}${full ? ' (heure de Paris)' : ''}`
}

export function quoteFreshness(security: DatedSecurity, valuation = false): FreshnessInfo {
  return {
    sources: [
      {
        symbol: security.symbol || 'Cours',
        asOf: valuation ? security.valuationAsOf : security.quoteAsOf,
        updatedAt: valuation ? security.valuationUpdatedAt : security.lastUpdated,
      },
    ],
  }
}

export function performanceFreshness(security: DatedSecurity, period = '1d'): FreshnessInfo {
  if (period === '1d') return quoteFreshness(security)
  return {
    calculatedAt: security.variationsCalculatedAt,
    sources: [{ symbol: security.symbol || 'Cours', asOf: security.variationsAsOf }],
  }
}

/** One marker describes all dated inputs shown in a security's table row. */
export function securityFreshness(
  security: DatedSecurity,
  period = '1d',
  valuation = false,
  extra: FreshnessInfo[] = []
): FreshnessInfo {
  const quote = quoteFreshness(security, valuation)
  quote.sources = quote.sources.map((source) => ({ ...source, label: 'Cours' }))
  const inputs = [quote]
  if (
    period !== '1d' ||
    security.variationsAsOf != null ||
    security.variationsCalculatedAt != null
  ) {
    const performance = performanceFreshness(security, period === '1d' ? '1m' : period)
    inputs.push({
      ...performance,
      sources: performance.sources.map((source) => ({ ...source, label: 'Performance' })),
    })
  }
  return combinedFreshness([...inputs, ...extra])
}

export function combinedFreshness(infos: FreshnessInfo[]): FreshnessInfo {
  const oldest = (values: DateInput[]) =>
    values
      .filter((value) => calendarDate(value))
      .reduce<DateInput>(
        (result, value) =>
          result == null || new Date(value!).getTime() < new Date(result).getTime()
            ? value
            : result,
        undefined
      )
  // Preserve known old calculations even when another input has no recorded date.
  return {
    calculatedAt: oldest(infos.map((info) => info.calculatedAt)),
    upstreamCalculatedAt: oldest(infos.map((info) => info.upstreamCalculatedAt)),
    unknownCalculation: infos.some(
      (info) =>
        info.unknownCalculation || ('calculatedAt' in info && !calendarDate(info.calculatedAt))
    ),
    sources: infos.flatMap((info) => info.sources),
  }
}
