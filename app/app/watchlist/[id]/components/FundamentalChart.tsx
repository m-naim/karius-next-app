'use client'
import { useEffect, useState } from 'react'
import { getFundamentals } from '@/services/stock.service'
import { BarValue } from '@/components/molecules/charts/BarValue'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { calculateCAGR, calculateR2 } from '@/lib/math'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface FinancialMetrics {
  fiscalDate: string
  totalRevenue: number
  netIncome: number
  ebitda: number
  eps: number
  freeCashFlow: number
  operatingCashflow: number
  totalAssets: number
  totalLiabilities: number
  [key: string]: any
}

interface FundamentalsData {
  symbol: string
  yearly: FinancialMetrics[]
  quarterly: FinancialMetrics[]
}

type MetricCategory = 'financial' | 'percentage' | 'ratio'

interface MetricDefinition {
  value: string
  label: string
  category: MetricCategory
  unit: string
}

const metrics: MetricDefinition[] = [
  { value: 'totalRevenue', label: "Chiffre d'affaires", category: 'financial', unit: '' },
  { value: 'grossProfit', label: 'Marge brute (Valeur)', category: 'financial', unit: '' },
  { value: 'operatingIncome', label: "Résultat d'exploitation", category: 'financial', unit: '' },
  { value: 'ebitda', label: 'EBITDA', category: 'financial', unit: '' },
  { value: 'netIncome', label: 'Résultat net', category: 'financial', unit: '' },
  { value: 'eps', label: 'BPA (EPS)', category: 'ratio', unit: '' },
  { value: 'operatingCashflow', label: 'Cash Flow Opérationnel', category: 'financial', unit: '' },
  { value: 'freeCashFlow', label: 'Free Cash Flow', category: 'financial', unit: '' },
  { value: 'totalAssets', label: 'Total Actif', category: 'financial', unit: '' },
  { value: 'totalLiabilities', label: 'Total Passif', category: 'financial', unit: '' },
  { value: 'grossMargin', label: 'Marge brute (%)', category: 'percentage', unit: '%' },
  { value: 'operatingMargin', label: "Marge d'exploit. (%)", category: 'percentage', unit: '%' },
  { value: 'netMargin', label: 'Marge nette (%)', category: 'percentage', unit: '%' },
  { value: 'roe', label: 'ROE (%)', category: 'percentage', unit: '%' },
  { value: 'roa', label: 'ROA (%)', category: 'percentage', unit: '%' },
  { value: 'debtToEquity', label: 'Dette/Capitaux Propres', category: 'ratio', unit: '' },
  { value: 'currentRatio', label: 'Ratio de liquidité', category: 'ratio', unit: '' },
]

export function FundamentalChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<FundamentalsData | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [periodType, setPeriodType] = useState<'yearly' | 'quarterly'>('yearly')
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0])
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0])
  const [loading, setLoading] = useState(true)
  const [showYoY, setShowYoY] = useState(false)

  const storageKey = 'fundamental_chart_metrics'

  useEffect(() => {
    // Load saved metrics from localStorage
    const savedMetrics = localStorage.getItem(storageKey)
    if (savedMetrics) {
      try {
        setSelectedMetrics(JSON.parse(savedMetrics))
      } catch (e) {
        setSelectedMetrics(['totalRevenue'])
      }
    } else {
      setSelectedMetrics(['totalRevenue'])
    }
  }, [])

  useEffect(() => {
    if (selectedMetrics.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(selectedMetrics))
    }
  }, [selectedMetrics])

  useEffect(() => {
    setLoading(true)
    getFundamentals(symbol)
      .then((res: FundamentalsData) => {
        setData(res)

        // Calculate min and max years available
        const allPoints = [...res.yearly, ...res.quarterly]
        if (allPoints.length > 0) {
          const years = allPoints.map((p) => new Date(p.fiscalDate).getFullYear())
          const minYear = Math.min(...years)
          const maxYear = Math.max(...years)
          setYearRange([minYear, maxYear])
          setSelectedRange([minYear, maxYear])
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch fundamentals:', err)
        setLoading(false)
      })
  }, [symbol])

  const calculateMetrics = (values: number[]) => {
    if (values.length < 2) return { cagr: null, r2: null }

    const first = values[0]
    const last = values[values.length - 1]
    const n = periodType === 'yearly' ? values.length - 1 : (values.length - 1) / 4

    const cagr = calculateCAGR(first, last, n)
    const r2 = calculateR2(values)

    return { cagr, r2 }
  }

  const addMetric = (metricValue: string) => {
    if (!selectedMetrics.includes(metricValue)) {
      setSelectedMetrics([...selectedMetrics, metricValue])
    }
  }

  const removeMetric = (metricValue: string) => {
    if (selectedMetrics.length > 1) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metricValue))
    }
  }

  // Filter and prepare data
  const rawPoints = data?.[periodType] || []
  const filteredPoints = rawPoints
    .filter((p) => {
      const year = new Date(p.fiscalDate).getFullYear()
      return year >= selectedRange[0] && year <= selectedRange[1]
    })
    .reverse() // Reverse for chronological order

  // Group selected metrics by category for separate charts
  const categoryOrder: MetricCategory[] = ['financial', 'percentage', 'ratio']

  const selectedMetricsByCategory = categoryOrder.reduce(
    (acc, category) => {
      const categoryMetrics = metrics.filter(
        (m) => m.category === category && selectedMetrics.includes(m.value)
      )
      if (categoryMetrics.length > 0) {
        acc[category] = categoryMetrics
      }
      return acc
    },
    {} as Record<MetricCategory, MetricDefinition[]>
  )

  const renderChart = (category: MetricCategory, categoryMetrics: MetricDefinition[]) => {
    const chartData = {
      labels: filteredPoints.map((m) => {
        const date = new Date(m.fiscalDate)
        const year = date.getFullYear()
        if (periodType === 'quarterly') {
          const quarter = Math.floor(date.getMonth() / 3) + 1
          return `Q${quarter} ${year}`
        }
        return year.toString()
      }),
      datasets: categoryMetrics.map((m, index) => {
        let mappedData = filteredPoints.map((point) => point[m.value] * (category === 'percentage' ? 100 : 1))

        if (showYoY) {
          mappedData = filteredPoints.map((point) => {
            const rawIdx = rawPoints.findIndex((rp) => rp.fiscalDate === point.fiscalDate)
            const prevOffset = periodType === 'yearly' ? 1 : 4
            const prevPoint = rawPoints[rawIdx + prevOffset]

            if (!prevPoint || prevPoint[m.value] === undefined || prevPoint[m.value] === 0) {
              return 0
            }
            return ((point[m.value] - prevPoint[m.value]) / Math.abs(prevPoint[m.value])) * 100
          })
        }

        return {
          label: m.label + (showYoY ? ' (YoY)' : ''),
          data: mappedData,
          backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'][
            index % 6
          ],
        }
      }),
    }

    const unit = showYoY ? '%' : categoryMetrics[0]?.unit || ''

    return (
      <div key={category} className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
          {category === 'financial'
            ? 'Financier'
            : category === 'percentage'
              ? 'Performance (%)'
              : 'Ratios'}
        </h3>
        <div className="h-[280px] w-full rounded-xl border bg-card/40 p-4 shadow-sm transition-all hover:shadow-md">
          <BarValue data={chartData} unit={unit} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select onValueChange={addMetric}>
            <SelectTrigger className="h-10 w-[180px] text-sm shadow-sm">
              <SelectValue placeholder="Ajouter une métrique..." />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              {categoryOrder.map((category, idx) => (
                <SelectGroup key={category}>
                  {idx > 0 && <SelectSeparator />}
                  <SelectLabel className="text-[10px] uppercase text-muted-foreground">
                    {category === 'financial'
                      ? 'Financier'
                      : category === 'percentage'
                        ? 'Performance (%)'
                        : 'Ratios'}
                  </SelectLabel>
                  {metrics
                    .filter((m) => m.category === category)
                    .map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value}
                        disabled={selectedMetrics.includes(m.value)}
                        className="text-xs"
                      >
                        {m.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showYoY ? 'default' : 'outline'}
            size="sm"
            className="h-10 px-4 text-xs font-bold uppercase tracking-wide shadow-sm transition-all"
            onClick={() => setShowYoY(!showYoY)}
          >
            YoY (%)
          </Button>
        </div>

        <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as any)} className="h-10">
          <TabsList className="grid h-10 w-[200px] grid-cols-2 p-1 shadow-sm">
            <TabsTrigger value="yearly" className="text-xs font-semibold">
              Annuel
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs font-semibold">
              Trimestriel
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedMetrics.map((mValue) => (
          <Badge
            key={mValue}
            variant="secondary"
            className="flex h-7 items-center gap-1.5 px-3 text-xs font-medium shadow-sm transition-colors hover:bg-secondary/80"
          >
            <span className="max-w-[150px] truncate">
              {metrics.find((m) => m.value === mValue)?.label}
            </span>
            <button
              onClick={() => removeMetric(mValue)}
              className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={selectedMetrics.length === 1}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-sm font-medium text-muted-foreground animate-pulse motion-reduce:animate-none">Chargement des données...</div>
        ) : filteredPoints.length > 0 ? (
          Object.entries(selectedMetricsByCategory).map(([category, categoryMetrics]) =>
            renderChart(category as MetricCategory, categoryMetrics)
          )
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm font-medium text-muted-foreground">
            Aucune donnée pour cette période
          </div>
        )}
      </div>

      {!loading && yearRange[0] !== yearRange[1] && (
        <div className="px-4 py-2 bg-muted/20 rounded-xl">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <span>
              Intervalle: {selectedRange[0]} - {selectedRange[1]}
            </span>
          </div>
          <Slider
            min={yearRange[0]}
            max={yearRange[1]}
            step={1}
            value={[selectedRange[0], selectedRange[1]]}
            onValueChange={(value) => setSelectedRange(value as [number, number])}
            className="py-2"
          />
        </div>
      )}
      {!loading && data && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {selectedMetrics.map((mValue, index) => {
            const vals = filteredPoints.map((m) => m[mValue])
            const { cagr, r2 } = calculateMetrics(vals)
            const label = metrics.find((m) => m.value === mValue)?.label
            const color = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'][
              index % 6
            ]

            return (
              <div
                key={mValue}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-sm font-bold text-foreground">{label}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      CAGR
                    </span>
                    <span
                      className={cn(
                        'text-sm font-black',
                        cagr !== null && cagr > 0
                          ? 'text-emerald-500'
                          : cagr !== null && cagr < 0
                            ? 'text-rose-500'
                            : 'text-foreground'
                      )}
                    >
                      {cagr !== null ? `${cagr.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      R²
                    </span>
                    <span className="text-sm font-black text-foreground">
                      {r2 !== null ? `${(r2 * 100).toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
