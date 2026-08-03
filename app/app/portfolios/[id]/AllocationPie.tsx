import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'
import { stringToColor } from '@/lib/colors'

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

const PALETTE = [
  'hsl(var(--primary))',
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#f97316',
]
const getItemColor = (index: number) => PALETTE[index % PALETTE.length]

const AllocationPie = ({ data, totalValue }: AllocationPieProps) => {
  const [view, setView] = useState<ViewType>('assets')
  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null)

  const pieData = useMemo(() => {
    if (view === 'assets') {
      return data
        .map((item) => ({
          name: item.symbol,
          value: item.totalValue,
          weight: item.weight * 100,
        }))
        .sort((a, b) => b.value - a.value)
    }

    const groupedData = data.reduce(
      (acc, item) => {
        const key =
          view === 'sectors' ? item.sector || 'Non catégorisé' : item.industry || 'Non catégorisé'
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
      {} as Record<string, HoveredData>
    )
    return Object.values(groupedData).sort((a, b) => b.value - a.value)
  }, [data, view])

  const topItems = useMemo(() => pieData.slice(0, 5), [pieData])

  const handleMouseEnter = (_: any, index: number) => {
    setHoveredData(pieData[index])
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Allocation</h3>
        <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
          <TabsList className="h-7 bg-muted/50 p-0.5">
            <TabsTrigger value="assets" className="h-6 px-2 text-xs">
              Actifs
            </TabsTrigger>
            <TabsTrigger value="sectors" className="h-6 px-2 text-xs">
              Secteurs
            </TabsTrigger>
            <TabsTrigger value="industries" className="h-6 px-2 text-xs">
              Métiers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={2}
              cornerRadius={4}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setHoveredData(null)}
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getItemColor(index)}
                  className="outline-none transition-opacity hover:opacity-80"
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {hoveredData ? (
            <div className="duration-200 animate-in fade-in zoom-in-95">
              <div className="max-w-[120px] truncate text-xs font-semibold uppercase text-muted-foreground">
                {hoveredData.name}
              </div>
              <div className="text-xl font-black">{hoveredData.weight.toFixed(1)}%</div>
              <div className="text-xs font-medium text-muted-foreground">
                {hoveredData.value.toLocaleString()} €
              </div>
            </div>
          ) : (
            <div className="duration-200 animate-in fade-in zoom-in-95">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </div>
              <div className="text-xl font-black">{totalValue.toLocaleString()} €</div>
              <div className="text-xs font-medium text-muted-foreground">
                {pieData.length} catégories
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Principales positions
        </h4>
        <div className="space-y-2">
          {topItems.map((item, i) => (
            <div key={i} className="group flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: getItemColor(i) }}
                  />
                  <span className="truncate font-medium text-foreground">{item.name}</span>
                </div>
                <span className="font-bold tabular-nums">{item.weight.toFixed(1)}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.weight}%`,
                    backgroundColor: getItemColor(i),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllocationPie
