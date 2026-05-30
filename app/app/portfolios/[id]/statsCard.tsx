import { Card, CardContent } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Clock, Activity } from 'lucide-react'

const StatsCard = ({ pftData }) => (
  <Card className="border-none bg-transparent shadow-none">
    <CardContent className="p-0">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        {/* Main Value */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Activity className="h-4 w-4" />
            <span>Valeur du Portefeuille</span>
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-6xl tabular-nums">
              {round10(pftData.totalValue, -2).toLocaleString()} €
            </h1>
            <div className="flex flex-col items-start md:flex-row md:items-center md:gap-2">
              <VariationContainer
                value={pftData.dayChangeValue}
                entity="€"
                className="text-lg font-bold p-0"
                background={false}
              />
              <VariationContainer 
                value={pftData.dayChangePercent} 
                entity="%" 
                className="text-sm px-2 py-0.5 rounded-full" 
              />
            </div>
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
                <VariationContainer
                  value={pftData.cumulativeReturn}
                  entity="€"
                  background={false}
                  className="p-0 text-sm font-bold"
                />
                <span className="text-muted-foreground/30">|</span>
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

export default StatsCard
