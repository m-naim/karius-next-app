import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { stringToColor } from './columns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface AllocationPieProps {
  data: Array<{
    symbol: string
    weight: number
    totalValue: number
    sector?: string
    industry?: string
  }>
  totalValue: number
}

type ViewType = 'assets' | 'sectors' | 'industries'

interface HoveredData {
  name: string
  value: number
  weight: number
}

const AllocationPie = ({ data, totalValue }: AllocationPieProps) => {
  const [view, setView] = useState<ViewType>('assets')
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null)

  const aggregateData = (type: ViewType) => {
    if (type === 'assets') {
      return data.map((item) => ({
        name: item.symbol,
        value: item.totalValue,
        weight: item.weight * 100,
      }))
    }

    console.log(data)

    const groupedData = data.reduce(
      (acc, item) => {
        const key =
          type === 'sectors' ? item.sector || 'Non catégorisé' : item.industry || 'Non catégorisé'
        if (!acc[key]) {
          acc[key] = {
            name: key,
            value: 0,
            weight: 0,
          }
        }
        acc[key].value += item.totalValue
        acc[key].weight += item.weight * 100
        return acc
      },
      {} as Record<string, { name: string; value: number; weight: number }>
    )
    console.log('grouped', groupedData)

    return Object.values(groupedData).sort((a, b) => b.value - a.value)
  }

  const pieData = aggregateData(view)

  const handleMouseEnter = (entry: { name: string; value: number; weight: number }) => {
    setHoveredData({
      name: entry.name,
      value: entry.value,
      weight: entry.weight,
    })
  }

  const handleMouseLeave = () => {
    setHoveredData(null)
  }

  const CenterDisplay = () => {
    if (hoveredData) {
      return (
        <div className="flex flex-col items-center justify-center p-2 text-center duration-200 animate-in fade-in zoom-in">
          <div className="line-clamp-2 text-xs font-medium sm:text-sm">{hoveredData.name}</div>
          <div className="text-base font-bold sm:text-lg">
            {hoveredData.value.toLocaleString()} €
          </div>
          <div className="text-[10px] text-muted-foreground sm:text-xs">
            {hoveredData.weight.toFixed(1)}%
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center p-2 duration-200 animate-in fade-in zoom-in">
        <div className="text-base font-bold sm:text-lg">{totalValue.toLocaleString()} €</div>
        <div className="text-[10px] text-muted-foreground sm:text-xs">Valeur Totale</div>
      </div>
    )
  }

  return (
    <Card className="flex w-full flex-col p-2">
      <CardHeader className="space-y-2 p-2 sm:space-y-0 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-medium sm:text-base">Allocation</CardTitle>
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as ViewType)}
            className="h-8 w-full sm:h-6 sm:w-auto"
          >
            <TabsList className="grid h-8 w-full grid-cols-3 gap-1 p-1 sm:h-6 sm:w-auto">
              <TabsTrigger
                value="assets"
                className="h-6 px-2 text-[10px] data-[state=active]:font-medium sm:text-xs"
              >
                Actifs
              </TabsTrigger>
              <TabsTrigger
                value="sectors"
                className="h-6 px-2 text-[10px] data-[state=active]:font-medium sm:text-xs"
              >
                Secteurs
              </TabsTrigger>
              <TabsTrigger
                value="industries"
                className="h-6 px-2 text-[10px] data-[state=active]:font-medium sm:text-xs"
              >
                Industries
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2 sm:pt-4">
        <div className="relative h-[180px] w-full sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart onMouseLeave={handleMouseLeave}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="95%"
                paddingAngle={1}
                onMouseEnter={(_, index) => handleMouseEnter(pieData[index])}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={stringToColor(entry.name)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <CenterDisplay />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AllocationPie
