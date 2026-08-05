import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, RotateCcw, Check } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface PresetOption {
  label: string
  min?: number | string
  max?: number | string
}

interface DataTableRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  unit?: string
  step?: number
  presets?: PresetOption[]
}

export function DataTableRangeFilter<TData, TValue>({
  column,
  title,
  unit = '',
  step = 0.1,
  presets,
}: DataTableRangeFilterProps<TData, TValue>) {
  const filterValue = (column?.getFilterValue() as { min?: string | number; max?: string | number }) || {}
  const minVal = filterValue.min !== undefined ? String(filterValue.min) : ''
  const maxVal = filterValue.max !== undefined ? String(filterValue.max) : ''

  const hasFilter = minVal !== '' || maxVal !== ''

  const applyRange = (newMin?: string | number, newMax?: string | number) => {
    const minStr = newMin !== undefined && newMin !== '' ? String(newMin) : undefined
    const maxStr = newMax !== undefined && newMax !== '' ? String(newMax) : undefined

    if (minStr === undefined && maxStr === undefined) {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue({
        min: minStr,
        max: maxStr,
      })
    }
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyRange(e.target.value, maxVal)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyRange(minVal, e.target.value)
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
              <Badge variant="secondary" className="rounded-sm px-1.5 font-semibold text-xs bg-primary/10 text-primary">
                {getLabel()}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 shadow-md" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-foreground">
              Filtrer par {title} {unit ? `(${unit})` : ''}
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

          {/* Preset Buttons if provided */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1 pb-1">
              {presets.map((p, idx) => {
                const isSelected =
                  String(p.min ?? '') === minVal && String(p.max ?? '') === maxVal
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyRange(p.min, p.max)}
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium transition-all border',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Custom Min / Max Inputs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Min {unit ? `(${unit})` : ''}
              </label>
              <Input
                type="number"
                step={step}
                placeholder="Ex: 10"
                value={minVal}
                onChange={handleMinChange}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Max {unit ? `(${unit})` : ''}
              </label>
              <Input
                type="number"
                step={step}
                placeholder="Ex: 50"
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
