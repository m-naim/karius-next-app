'use client'

type AnalysisDrawerTitleProps = {
  symbol: string
  price?: number | null
  currency?: string | null
}

export function AnalysisDrawerTitle({ symbol, price, currency }: AnalysisDrawerTitleProps) {
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
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="truncate text-base font-black tracking-tight text-foreground">{symbol}</span>
      {formattedPrice && (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          {formattedPrice}
        </span>
      )}
    </div>
  )
}
