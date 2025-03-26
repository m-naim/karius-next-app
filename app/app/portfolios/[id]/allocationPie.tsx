import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { stringToColor } from './columns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface AllocationPieProps {
  data: Array<{
    symbol: string
    weight: number
    total_value: number
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
        value: item.total_value,
        weight: item.weight * 100,
      }))
    }

    const groupedData = data.reduce((acc, item) => {
      const key = type === 'sectors' ? (item.sector || 'Non catégorisé') : (item.industry || 'Non catégorisé')
      if (!acc[key]) {
        acc[key] = {
          name: key,
          value: 0,
          weight: 0,
        }
      }
      acc[key].value += item.total_value
      acc[key].weight += item.weight * 100
      return acc
    }, {} as Record<string, { name: string; value: number; weight: number }>)

    return Object.values(groupedData).sort((a, b) => b.value - a.value)
  }

  const pieData = aggregateData(view)

  const handleMouseEnter = (entry: any) => {
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
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
          <div className="text-sm font-medium">
            {hoveredData.name}
          </div>
          <div className="text-lg font-bold">
            {hoveredData.value.toLocaleString()} €
          </div>
          <div className="text-xs text-muted-foreground">
            {hoveredData.weight.toFixed(1)}%
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <div className="text-lg font-bold">
          {totalValue.toLocaleString()} €
        </div>
        <div className="text-xs text-muted-foreground">
          Valeur Totale
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col p-2">
      <CardHeader className="space-y-0 p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium">Allocation</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="h-6">
            <TabsList className="h-6 p-0">
              <TabsTrigger value="assets" className="h-6 px-2 text-[10px]">
                Actifs
              </TabsTrigger>
              <TabsTrigger value="sectors" className="h-6 px-2 text-[10px]">
                Secteurs
              </TabsTrigger>
              <TabsTrigger value="industries" className="h-6 px-2 text-[10px]">
                Industries
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="relative h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart onMouseLeave={handleMouseLeave}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <CenterDisplay />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AllocationPie 