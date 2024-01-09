import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const StatsCard = ({ title, amount, variation, Icon }) => (
  <Card className="h-fit w-[10rem] flex-grow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
      <CardTitle className="text-sm font-medium capitalize">{title}</CardTitle>
      {Icon}
    </CardHeader>
    <CardContent>
      <div className="flex gap-2">
        <div className="text-xl font-bold">{amount}€ </div>
        <p className="text-sm">+{variation}%</p>
      </div>
    </CardContent>
  </Card>
)

export default StatsCard
