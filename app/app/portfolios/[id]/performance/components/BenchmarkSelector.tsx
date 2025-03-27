import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

export const benchmarkOptions = [
  { value: '^GSPC', label: 'S&P 500' },
  { value: '^FCHI', label: 'CAC 40' },
  { value: '^STOXX50E', label: 'EURO STOXX 50' },
]

interface BenchmarkSelectorProps {
  selectedBenchmarks: string[]
  onAddBenchmark: (benchmark: string) => void
  onRemoveBenchmark: (benchmark: string) => void
  error?: string
}

export function validateBenchmark(value: string) {
  const regex = /^\^?[A-Z0-9.]{1,10}$/
  return regex.test(value)
}

export default function BenchmarkSelector({
  selectedBenchmarks,
  onAddBenchmark,
  onRemoveBenchmark,
  error,
}: BenchmarkSelectorProps) {
  const [customBenchmark, setCustomBenchmark] = React.useState('')

  const handleAddCustomBenchmark = () => {
    if (customBenchmark) {
      onAddBenchmark(customBenchmark)
      setCustomBenchmark('')
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select onValueChange={(value) => onAddBenchmark(value)} value="">
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ajouter un benchmark" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {benchmarkOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={selectedBenchmarks.includes(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            className="flex-1 sm:w-[120px] sm:flex-none"
            placeholder="Code personnalisé"
            value={customBenchmark}
            onChange={(e) => setCustomBenchmark(e.target.value.toUpperCase())}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddCustomBenchmark}
            disabled={!customBenchmark}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <span className="order-last text-sm text-red-500">{error}</span>}

      <div className="flex flex-wrap gap-2">
        {selectedBenchmarks.map((benchmark) => (
          <div
            key={benchmark}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
          >
            <span className="line-clamp-1">
              {benchmarkOptions.find((b) => b.value === benchmark)?.label || benchmark}
            </span>
            <button
              onClick={() => onRemoveBenchmark(benchmark)}
              className="ml-1 rounded-full p-1 hover:bg-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
