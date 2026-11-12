export function PriceValue({ value, currency = 'EUR' }: { value: number; currency?: string }) {
  if (!Number.isFinite(value)) return <span>—</span>
  const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(value)
  return (
    <span className="font-medium tabular-nums">
      <span className="flex flex-col md:hidden">
        <span className="whitespace-normal [overflow-wrap:anywhere]">{amount}</span>
        <span className="text-[10px] text-muted-foreground">{currency}</span>
      </span>
      <span className="hidden md:inline">{formatted}</span>
    </span>
  )
}
