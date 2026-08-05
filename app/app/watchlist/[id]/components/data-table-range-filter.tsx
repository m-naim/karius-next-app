import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, RotateCcw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface DataTableRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  unit?: string
  step?: number
}

export function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  unit = '',
  step = 0.1,
}: DataTableRangeFilterProps<TData, TValue>) {
  const filterValue = (column?.getFilterValue() as { min?: string | number; max?: string | number }) || {}
  const minVal = filterValue.min !== undefined ? String(filterValue.min) : ''
  const maxVal = filterValue.max !== undefined ? String(filterValue.max) : ''

  const hasFilter = minVal !== '' || maxVal !== ''

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    column?.setFilterValue({
      ...filterValue,
      min: val !== '' ? val : undefined,
    })
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    column?.setFilterValue({
      ...filterValue,
      max: val !== '' ? val : undefined,
    })
  }

  const handleReset = () => {
    column?.setFilterValue(undefined)
  }

  const getLabel = () => {
    if (minVal !== '' && maxVal !== '') {
      return `${minVal} à ${maxVal}${unit}`
    }
    if (minVal !== '') {
      return `≥ ${minVal}${unit}`
    }
    if (maxVal !== '') {
      return `≤ ${maxVal}${unit}`
    }
    return ''
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {hasFilter && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1.5 font-semibold text-xs">
                {getLabel()}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold text-foreground">
              Filtre {title} {unit ? `(${unit})` : ''}
            </span>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Effacer
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Minimum
              </label>
              <Input
                type="number"
                step={step}
                placeholder="Min"
                value={minVal}
                onChange={handleMinChange}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Maximum
              </label>
              <Input
                type="number"
                step={step}
                placeholder="Max"
                value={maxVal}
                onChange={handleMaxChange}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
