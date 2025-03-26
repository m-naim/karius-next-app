import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, ArrowUpDown, Clock } from 'lucide-react'

const StatsCard = ({ pftData }) => (
  <Card className="flex flex-col p-2">
    <CardContent className="space-y-2 p-0">
      {/* Valeur Totale et Variation du jour */}
      <div>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-xs font-medium text-muted-foreground">Aujourd'hui</div>
          <div className="ml-auto text-[10px] text-muted-foreground">
            {pftData.last_perfs_update}
          </div>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div>
            <div className="text-lg font-bold">
              {round10(pftData.totalValue, -2).toLocaleString()} €
            </div>
            <div className="text-xs text-muted-foreground">Valeur Totale</div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <VariationContainer 
              value={pftData.dayChangeValue} 
              entity="€" 
              className="text-sm"
              background={false}
            />
            <VariationContainer 
              value={pftData.dayChangePercent} 
              entity="%" 
              className="text-xs"
            />
          </div>
        </div>
      </div>

      <Separator className="my-1.5" />

      {/* Performance Globale */}
      <div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Performance Globale</span>
        </div>
        
        <div className="mt-1 grid gap-1">
          <div className="grid grid-cols-2 items-center">
            <div className="text-xs text-muted-foreground">Gains Totaux</div>
            <div className="flex justify-end gap-1">
              <VariationContainer 
                value={pftData.cumulativeReturn} 
                entity="€" 
                background={false}
                className="text-sm" 
              />
              <VariationContainer 
                value={pftData.cumulativePerformance} 
                entity="%" 
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 items-center">
            <div className="text-xs text-muted-foreground">Performance / An</div>
            <div className="flex justify-end">
              <VariationContainer
                vaiationColor={false}
                value={pftData.annualizedReturn}
                entity="% / an"
                background={false}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default StatsCard
