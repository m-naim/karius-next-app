import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '../../../../components/molecules/portfolio/variationContainer'
import { Separator } from '@/components/ui/separator'

const StatsCard = ({ pftData }) => (
  <Card className="flex flex-col gap-2 px-4 py-2">
    <CardContent>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm font-light">Valeur Total</div>
        <div className=" text-sm">{round10(pftData.totalValue, -2)} € </div>
      </div>
      <Separator />
      <div className="my-2 text-sm font-semibold">Performance</div>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm font-light ">Performance Cumulé </div>
        <div className="flex gap-2">
          <VariationContainer value={pftData.cumulativeReturn} entity="€" background={false} />
          <VariationContainer value={pftData.cumulativePerformance} entity="%" />
        </div>

        <div className="text-sm font-light">Variation du jour</div>
        <div className="flex gap-2">
          <VariationContainer value={pftData.dayChangeValue} entity="€" background={false} />
          <VariationContainer value={pftData.dayChangePercent} entity="%" />
        </div>

        <div className="text-sm font-light ">Performance Annualisé</div>
        <div className=" text-sm">
          <VariationContainer
            vaiationColor={false}
            value={pftData.annualizedReturn}
            entity="% / an"
            background={false}
          />
        </div>
      </div>

      <Separator />

      <div className="text-md my-2 text-sm  font-semibold ">Dividendes</div>
      <div className="grid grid-cols-2 pb-1">
        <div className="text-sm  font-extralight ">Rendument</div>{' '}
        <div className=" text-sm">x%</div>
        <div className="text-sm  font-light ">Total perçu</div> <div className=" text-sm">x€</div>
        <div className="text-sm  font-light ">Annualisé</div> <div className=" text-sm">x/an</div>
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
