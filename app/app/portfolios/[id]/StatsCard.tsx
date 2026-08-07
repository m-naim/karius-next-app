import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Clock, Globe } from 'lucide-react'

const StatsCard = ({ pftData, own = true }) => {
  const currencySymbol = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: pftData?.baseCurrency || 'EUR' 
  }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'

  const formatCompactValue = (val: number) => {
    if (!val || val === 0) return `0 ${currencySymbol}`
    if (val >= 1_000_000_000) {
      const b = val / 1_000_000_000
      return `${b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)} Md ${currencySymbol}`
    }
    if (val >= 1_000_000) {
      const m = val / 1_000_000
      return `${m >= 100 ? m.toFixed(0) : m >= 10 ? m.toFixed(1) : m.toFixed(2)} M ${currencySymbol}`
    }
    return `${round10(val, -2).toLocaleString()} ${currencySymbol}`
  }

  const fullFormattedValue = `${round10(pftData?.totalValue || 0, -2).toLocaleString()} ${currencySymbol}`

  return (
    <div className="flex w-full items-center justify-between gap-3 sm:gap-6 flex-wrap py-2 px-3.5 sm:px-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-2xs">
      {/* LEFT: Main Balance + Day Variation */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {own ? (
          <div className="flex items-baseline gap-2">
            <h1 
              className="text-xl sm:text-2xl font-black tracking-tight text-foreground tabular-nums" 
              title={fullFormattedValue}
            >
              {formatCompactValue(pftData?.totalValue)}
            </h1>
            <div className="flex items-center gap-1.5">
              <VariationContainer
                value={pftData?.dayChangeValue}
                entity={currencySymbol}
                className="text-xs font-bold p-0"
                background={false}
              />
              <VariationContainer 
                value={pftData?.dayChangePercent} 
                entity="%" 
                className="text-[11px] font-bold px-1.5 py-0.2 rounded-full" 
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm sm:text-base font-bold text-foreground">Portefeuille Public</span>
            {pftData?.dayChangePercent != null && (
              <VariationContainer 
                value={pftData?.dayChangePercent} 
                entity="%" 
                className="text-[11px] font-bold px-1.5 py-0.2 rounded-full" 
              />
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Gains, Annual Return & Timestamp in one continuous horizontal line */}
      <div className="flex items-center gap-3 sm:gap-5 text-xs text-muted-foreground flex-wrap">
        {/* Gains Totaux */}
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-[11px]">Gains:</span>
          <div className="flex items-center gap-1 tabular-nums font-bold">
            {own && pftData?.cumulativeReturn != null && (
              <VariationContainer
                value={pftData?.cumulativeReturn}
                entity={currencySymbol}
                background={false}
                className="p-0 text-xs font-bold"
              />
            )}
            <VariationContainer
              value={pftData?.cumulativePerformance}
              entity="%"
              className="px-1.5 py-0.2 text-[11px] rounded-md font-bold"
            />
          </div>
        </div>

        <div className="h-3.5 w-px bg-border/60 shrink-0 hidden sm:block" />

        {/* Rendement Annuel */}
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-[11px]">Annuel:</span>
          <VariationContainer
            value={pftData?.annualizedReturn}
            entity=" %/an"
            background={false}
            className="p-0 text-xs font-bold tabular-nums"
          />
        </div>

        {pftData?.last_perfs_update && (
          <>
            <div className="h-3.5 w-px bg-border/60 shrink-0 hidden md:block" />
            <div className="items-center gap-1 text-[11px] text-muted-foreground/70 hidden md:flex">
              <Clock className="h-3 w-3" />
              <span>{pftData.last_perfs_update}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StatsCard
