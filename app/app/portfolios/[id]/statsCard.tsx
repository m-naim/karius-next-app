import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Separator } from '@/components/ui/separator'

const StatsCard = ({ pftData }) => (
  <Card className="px-4 py-2">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-0">
      {/* <CardTitle className="text-md font-medium capitalize">Resume</CardTitle> */}
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm font-light">Valeur Total</div>
        <div className="font-mono text-sm">{round10(pftData.totalValue, -2)} € </div>
      </div>
      <Separator />
      <div className="my-2 text-sm font-semibold">Performance</div>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm font-light ">Performance Cumulé </div>
        <div className="flex gap-2">
          <VariationContainer value={pftData.cumulativeReturn} entity="€" />
          <VariationContainer value={pftData.cumulativePerformance} entity="%" />
        </div>

        <div className="text-sm font-light">Variation du jour</div>
        <div className="flex gap-2">
          <VariationContainer value={pftData.dayChangeValue} entity="€" />
          <VariationContainer value={pftData.dayChangePercent} entity="%" />
        </div>

        <div className="text-sm font-light ">Annualisé</div>
        <div className="font-mono text-sm">x/an</div>
      </div>

      <Separator />

      <div className="text-md my-2 text-sm  font-semibold ">Dividendes</div>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm  font-extralight ">Rendument</div>{' '}
        <div className="font-mono text-sm">x%</div>
        <div className="text-sm  font-light ">Total perçu</div>{' '}
        <div className="font-mono text-sm">x€</div>
        <div className="text-sm  font-light ">Annualisé</div>{' '}
        <div className="font-mono text-sm">x/an</div>
      </div>
      <Separator />
      <div className="my-4 grid grid-cols-2 pb-1">
        <div className="text-sm font-light ">Dernier Màj</div>
        <div className="text-xs font-light">{pftData.last_perfs_update}</div>
      </div>
    </CardContent>
  </Card>
)

export default StatsCard
