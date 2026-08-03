import { Card, CardContent } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Clock, Activity, Lock } from 'lucide-react'

const StatsCard = ({ pftData, own = true }) => {
  const currencySymbol = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: pftData.baseCurrency || 'EUR' 
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

  const fullFormattedValue = `${round10(pftData.totalValue || 0, -2).toLocaleString()} ${currencySymbol}`

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          {/* Main Value */}
          <div className="space-y-1 w-full md:w-auto">
            <span className="text-xs font-semibold text-muted-foreground">Valeur du portefeuille</span>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              {own ? (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-foreground tabular-nums break-all" title={fullFormattedValue}>
                    {formatCompactValue(pftData.totalValue)}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <VariationContainer
                      value={pftData.dayChangeValue}
                      entity={currencySymbol}
                      className="text-base sm:text-lg font-bold p-0"
                      background={false}
                    />
                    <VariationContainer 
                      value={pftData.dayChangePercent} 
                      entity="%" 
                      className="text-xs sm:text-sm px-2 py-0.5 rounded-full" 
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3.5 py-1.5 border border-border/50 text-muted-foreground">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Portefeuille Public</span>
                  </div>
                  {pftData.dayChangePercent != null && (
                    <VariationContainer 
                      value={pftData.dayChangePercent} 
                      entity="%" 
                      className="text-xs sm:text-sm px-2 py-0.5 rounded-full" 
                    />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Dernière mise à jour : {pftData.last_perfs_update || 'N/A'}</span>
            </div>
          </div>

          {/* Global Performance Metrics */}
          <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:w-auto md:min-w-[320px]">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">Performance Globale</span>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Gains Totaux</span>
                <div className="flex items-center gap-2 tabular-nums">
                  {own && (
                    <>
                      <VariationContainer
                        value={pftData.cumulativeReturn}
                        entity={currencySymbol}
                        background={false}
                        className="p-0 text-sm font-bold"
                      />
                      <span className="text-muted-foreground/30">|</span>
                    </>
                  )}
                  <VariationContainer
                    value={pftData.cumulativePerformance}
                    entity="%"
                    className="px-1.5 py-0.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Rendement Annuel</span>
                <VariationContainer
                  vaiationColor={false}
                  value={pftData.annualizedReturn}
                  entity=" %/an"
                  background={false}
                  className="p-0 text-sm font-bold tabular-nums text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatsCard
