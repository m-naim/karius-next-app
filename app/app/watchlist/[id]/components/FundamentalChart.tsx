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
      datasets: categoryMetrics.map((m, index) => ({
        label: m.label,
        data: filteredPoints.map((point) => point[m.value] * (category === 'percentage' ? 100 : 1)),
        backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'][
          index % 6
        ],
      })),
    }

    const unit = categoryMetrics[0]?.unit || ''

    return (
      <div key={category} className="space-y-1">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {category === 'financial'
            ? 'Financier'
            : category === 'percentage'
              ? 'Performance (%)'
              : 'Ratios'}
        </h3>
        <div className="h-[200px] w-full rounded-lg border bg-card/40 p-1">
          <BarValue data={chartData} unit={unit} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select onValueChange={addMetric}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Métrique" />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as any)} className="h-8">
          <TabsList className="grid h-8 w-[160px] grid-cols-2 p-0.5">
            <TabsTrigger value="yearly" className="py-1 text-[11px]">
              Annuel
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="py-1 text-[11px]">
              Trimestriel
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {selectedMetrics.map((mValue) => (
          <Badge
            key={mValue}
            variant="secondary"
            className="flex h-5 items-center gap-1 pl-2 pr-1 text-[10px]"
          >
            <span className="max-w-[100px] truncate">
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

      <div className="space-y-3">
        {loading ? (
          <div className="flex h-[200px] items-center justify-center text-sm">Chargement...</div>
        ) : filteredPoints.length > 0 ? (
          Object.entries(selectedMetricsByCategory).map(([category, categoryMetrics]) =>
            renderChart(category as MetricCategory, categoryMetrics)
          )
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnée pour cette période
          </div>
        )}
      </div>

      {!loading && yearRange[0] !== yearRange[1] && (
        <div className="px-2">
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
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
        <div className="grid grid-cols-2 gap-1.5">
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
                className="flex items-center justify-between rounded border bg-muted/10 px-2 py-1.5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-[10px] font-bold">{label}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground/60">
                      CAGR
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        cagr !== null && cagr > 0
                          ? 'text-green-600'
                          : cagr !== null && cagr < 0
                            ? 'text-red-600'
                            : ''
                      )}
                    >
                      {cagr !== null ? `${cagr.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground/60">
                      R²
                    </span>
                    <span className="text-[10px] font-bold">
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
