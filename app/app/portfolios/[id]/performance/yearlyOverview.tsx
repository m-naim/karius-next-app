import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Loader from '@/components/molecules/loader/loader'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPerformancesSummary } from '@/services/portfolioService'
import { useEffect, useState } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { benchmarkOptions } from './components/BenchmarkSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const month = [
  { value: 'January', display: 'Jan' },
  { value: 'February', display: 'Fév' },
  { value: 'March', display: 'Mar' },
  { value: 'April', display: 'Avr' },
  { value: 'May', display: 'Mai' },
  { value: 'June', display: 'Juin' },
  { value: 'July', display: 'Juil' },
  { value: 'August', display: 'Août' },
  { value: 'September', display: 'Sep' },
  { value: 'October', display: 'Oct' },
  { value: 'November', display: 'Nov' },
  { value: 'December', display: 'Déc' },
]

interface YearlyOverviewProps {
  id: string
  selectedBenchmarks: string[]
}

export default function YearlyOverview({ id, selectedBenchmarks }: YearlyOverviewProps) {
  const [perf, setPerf] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await getPerformancesSummary(id as string)).sort((b, a) => b.year - a.year)
        setPerf(data)
        setSelectedYear(data.at(-1).year)
        setLoading(false)
      } catch (e) {
        console.error('error api', e)
      }
    }
    fetchData()
  }, [id])

  const isCurrentYear = (year: string) => year === new Date().getFullYear().toString()

  return loading ? (
    <Loader />
  ) : (
    <Card className="w-full overflow-hidden border border-gray-200 bg-white">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 md:p-6">
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg md:text-xl">Performance annuelle</h2>
            <p className="text-xs text-gray-500 sm:text-sm">Vue mensuelle des performances</p>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 md:hidden"
            >
              {isExpanded ? 'Réduire' : 'Voir tout'}
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )} />
            </button>
            <Select onValueChange={(e) => setSelectedYear(e)} defaultValue={selectedYear}>
              <SelectTrigger className="flex h-10 w-32 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {perf.map(({ year }) => (
                    <SelectItem 
                      key={year} 
                      value={year}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-700 data-[highlighted]:bg-gray-100"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(100vh-16rem)]">
          <div className={cn(
            "grid w-full divide-x divide-gray-200",
            "grid-cols-[90px_1fr] sm:grid-cols-[120px_1fr] lg:grid-cols-[160px_1fr]",
            !isExpanded && "max-h-[360px] md:max-h-none overflow-hidden"
          )}>
            <div className="sticky left-0 z-10 space-y-0 bg-gray-50/80">
              <div className="flex h-12 items-center border-b border-gray-200 px-3 text-[11px] font-medium uppercase tracking-wider text-gray-500 sm:h-14 sm:px-4 lg:px-5 sm:text-xs">
                Mois
              </div>
              {month.map((m) => (
                <div key={m.value} className="flex h-10 items-center border-b border-gray-100/50 px-3 text-[11px] text-gray-600 sm:h-12 sm:px-4 lg:px-5 sm:text-xs">
                  {m.display}
                </div>
              ))}
              <div className="flex h-12 items-center bg-gray-100/80 px-3 text-[11px] font-medium text-gray-900 sm:h-14 sm:px-4 lg:px-5 sm:text-xs">
                Total
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="grid auto-cols-[minmax(100px,1fr)] grid-flow-col sm:auto-cols-[minmax(120px,1fr)]">
                {perf &&
                  perf
                    .filter(({ year }) => year === selectedYear)
                    .map(({ year, performance, monthlyPerformance }) => (
                      <div key={year} className="space-y-0 border-r border-gray-200 last:border-r-0">
                        <div className={cn(
                          "flex h-12 items-center justify-end border-b border-gray-200 px-3 text-[11px] font-medium sm:h-14 sm:px-4 lg:px-5 sm:text-xs",
                          isCurrentYear(year) ? "text-blue-600" : "text-gray-900"
                        )}>
                          {year}
                        </div>
                        {month.map((m) => (
                          <div key={m.value} className="flex h-10 items-center justify-end border-b border-gray-100/50 px-3 hover:bg-gray-50/50 sm:h-12 sm:px-4 lg:px-5">
                            {monthlyPerformance[m.value] ? (
                              <VariationContainer
                                value={monthlyPerformance[m.value]}
                                className="text-[11px] font-medium sm:text-xs"
                              />
                            ) : (
                              <span className="text-[11px] text-gray-400 sm:text-xs">—</span>
                            )}
                          </div>
                        ))}
                        <div className="flex h-12 items-center justify-end bg-gray-100/80 px-3 sm:h-14 sm:px-4 lg:px-5">
                          <VariationContainer 
                            value={performance} 
                            className="text-[11px] font-medium sm:text-xs" 
                          />
                        </div>
                      </div>
                    ))}

                {selectedBenchmarks.map((benchmark) => (
                  <div key={benchmark} className="space-y-0 border-r border-gray-200 last:border-r-0">
                    <div className="flex h-12 items-center justify-end border-b border-gray-200 px-3 text-[11px] font-medium text-gray-500 sm:h-14 sm:px-4 lg:px-5 sm:text-xs">
                      {benchmarkOptions.find(b => b.value === benchmark)?.label || benchmark}
                    </div>
                    {month.map((m) => (
                      <div key={m.value} className="flex h-10 items-center justify-end border-b border-gray-100/50 px-3 hover:bg-gray-50/50 sm:h-12 sm:px-4 lg:px-5">
                        <span className="text-[11px] text-gray-400 sm:text-xs">—</span>
                      </div>
                    ))}
                    <div className="flex h-12 items-center justify-end bg-gray-100/80 px-3 sm:h-14 sm:px-4 lg:px-5">
                      <span className="text-[11px] text-gray-400 sm:text-xs">—</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}
