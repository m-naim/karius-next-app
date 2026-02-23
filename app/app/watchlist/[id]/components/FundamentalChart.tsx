'use client'
import { useEffect, useState } from 'react'
import { getFundamentals } from '@/services/stock.service'
import { BarValue } from '@/components/molecules/charts/BarValue'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
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

const metrics = [
  { value: 'totalRevenue', label: "Chiffre d'affaires" },
  { value: 'grossProfit', label: 'Marge brute (Valeur)' },
  { value: 'operatingIncome', label: "Résultat d'exploitation" },
  { value: 'ebitda', label: 'EBITDA' },
  { value: 'netIncome', label: 'Résultat net' },
  { value: 'eps', label: 'BPA (EPS)' },
  { value: 'operatingCashflow', label: 'Cash Flow Opérationnel' },
  { value: 'freeCashFlow', label: 'Free Cash Flow' },
  { value: 'totalAssets', label: 'Total Actif' },
  { value: 'totalLiabilities', label: 'Total Passif' },
  { value: 'grossMargin', label: 'Marge brute (%)' },
  { value: 'operatingMargin', label: "Marge d'exploit. (%)" },
  { value: 'netMargin', label: 'Marge nette (%)' },
  { value: 'roe', label: 'ROE (%)' },
  { value: 'roa', label: 'ROA (%)' },
  { value: 'debtToEquity', label: 'Dette/Capitaux Propres' },
  { value: 'currentRatio', label: 'Ratio de liquidité' },
]

export function FundamentalChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<FundamentalsData | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['totalRevenue'])
  const [periodType, setPeriodType] = useState<'yearly' | 'quarterly'>('yearly')
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0])
  const [selectedRange, setSelectedRange] = useState<[number, number]>([0, 0])
  const [loading, setLoading] = useState(true)

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
    datasets: selectedMetrics.map((mValue, index) => ({
      label: metrics.find((m) => m.value === mValue)?.label || '',
      data: filteredPoints.map((m) => m[mValue]),
      backgroundColor: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'][
        index % 6
      ],
    })),
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select onValueChange={addMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Métrique" />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((m) => (
                <SelectItem
                  key={m.value}
                  value={m.value}
                  disabled={selectedMetrics.includes(m.value)}
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as any)}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="yearly">Annuel</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestriel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedMetrics.map((mValue) => (
          <Badge key={mValue} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
            <span className="max-w-[120px] truncate">
              {metrics.find((m) => m.value === mValue)?.label}
            </span>
            <button
              onClick={() => removeMetric(mValue)}
              className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={selectedMetrics.length === 1}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="h-[350px] w-full rounded-lg border bg-card p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center">Chargement...</div>
        ) : filteredPoints.length > 0 ? (
          <BarValue data={chartData} unit="" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Aucune donnée pour cette période
          </div>
        )}
      </div>

      {!loading && yearRange[0] !== yearRange[1] && (
        <div className=" px-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
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
            className="py-4"
          />
        </div>
      )}
      {!loading && data && (
        <div className="grid grid-cols-1 gap-2">
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
                className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3"
              >
                <div className="flex max-w-[200px] items-center gap-2 truncate">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-sm font-semibold">{label}</span>
                </div>
                <div className="flex gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                      CAGR
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold',
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
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                      LIN. (R²)
                    </span>
                    <span className="text-sm font-bold">
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
