import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, Search, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSuperInvestors, InvestorSummary } from '@/services/superInvestorService'

export const benchmarkOptions = [
  { value: '^GSPC', label: 'S&P 500' },
  { value: '^FCHI', label: 'CAC 40' },
  { value: '^STOXX50E', label: 'EURO STOXX 50' },
]

interface BenchmarkSelectorProps {
  selectedBenchmarks: string[]
  onAddBenchmark: (benchmark: string) => void
  onRemoveBenchmark: (benchmark: string) => void
}

export function validateBenchmark(value: string) {
  if (/^SUPER_INVESTOR:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return true
  const regex = /^\^?[A-Z0-9.]{1,10}$/
  return regex.test(value)
}

export default function BenchmarkSelector({
  selectedBenchmarks,
  onAddBenchmark,
  onRemoveBenchmark,
}: BenchmarkSelectorProps) {
  const [customBenchmark, setCustomBenchmark] = React.useState('')
  const [superInvestors, setSuperInvestors] = React.useState<InvestorSummary[]>([])

  React.useEffect(() => {
    getSuperInvestors().then(setSuperInvestors).catch(() => setSuperInvestors([]))
  }, [])

  const labelFor = (benchmark: string) => {
    const market = benchmarkOptions.find((option) => option.value === benchmark)?.label
    if (market) return market
    if (benchmark.startsWith('SUPER_INVESTOR:')) {
      const slug = benchmark.slice('SUPER_INVESTOR:'.length)
      return superInvestors.find((investor) => investor.slug === slug)?.displayName || slug
    }
    return benchmark
  }

  const handleAddCustomBenchmark = (e: React.MouseEvent) => {
    e.preventDefault()
    if (customBenchmark && validateBenchmark(customBenchmark)) {
      onAddBenchmark(customBenchmark)
      setCustomBenchmark('')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
            <Plus className="h-3.5 w-3.5" />
            <span>Comparer</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Indices de référence</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {benchmarkOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                disabled={selectedBenchmarks.includes(option.value)}
                onClick={() => onAddBenchmark(option.value)}
                className="cursor-pointer"
              >
                <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {superInvestors.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Super Investors</DropdownMenuLabel>
              <DropdownMenuGroup>
                {superInvestors.map((investor) => {
                  const value = `SUPER_INVESTOR:${investor.slug}`
                  return (
                    <DropdownMenuItem
                      key={value}
                      disabled={selectedBenchmarks.includes(value)}
                      onClick={() => onAddBenchmark(value)}
                      className="cursor-pointer"
                    >
                      <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{investor.displayName}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <div className="p-2">
            <div className="flex gap-2">
              <Input
                placeholder="Symbole (ex: AAPL)"
                value={customBenchmark}
                onChange={(e) => setCustomBenchmark(e.target.value.toUpperCase())}
                className="h-8 text-xs"
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleAddCustomBenchmark}
                disabled={!customBenchmark || !validateBenchmark(customBenchmark)}
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-wrap items-center gap-1.5">
        {selectedBenchmarks.map((benchmark) => (
          <Badge
            key={benchmark}
            variant="secondary"
            className="h-7 items-center gap-1 pl-2 pr-1 font-medium"
          >
            {labelFor(benchmark)}
            <button
              onClick={() => onRemoveBenchmark(benchmark)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
