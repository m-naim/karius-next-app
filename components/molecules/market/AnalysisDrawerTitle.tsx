'use client'

import { DataFreshness } from '@/components/molecules/DataFreshness'
import { DateInput, quoteFreshness } from '@/lib/data-freshness'

type AnalysisDrawerTitleProps = {
  symbol: string
  price?: number | null
  currency?: string | null
  quoteAsOf?: DateInput
  lastUpdated?: DateInput
}

export function AnalysisDrawerTitle({ symbol, price, currency, quoteAsOf, lastUpdated }: AnalysisDrawerTitleProps) {
  const numericPrice = Number(price)
  const hasPrice = price != null && Number.isFinite(numericPrice)
  const formattedPrice = hasPrice
    ? currency
      ? new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          maximumFractionDigits: 2,
        }).format(numericPrice)
      : new Intl.NumberFormat('fr-FR', {
          maximumFractionDigits: 2,
        }).format(numericPrice)
    : null

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="truncate text-base font-black tracking-tight text-foreground">{symbol}</span>
      {formattedPrice && (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          <DataFreshness info={quoteFreshness({ symbol, quoteAsOf, lastUpdated })}>{formattedPrice}</DataFreshness>
        </span>
      )}
    </div>
  )
}
