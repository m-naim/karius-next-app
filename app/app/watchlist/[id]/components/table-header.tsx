import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddStockButton } from './AddStockButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, Filter, Search, Settings2, Sparkles, Check, X, XCircleIcon } from 'lucide-react'
import watchListService from '@/services/watchListService'
import { DataTableFacetedFilter } from './data-table-filter'
import { DataTableRangeFilter } from './data-table-range-filter'
import { industries, sectors } from '../data/data'
import { Table } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { RECOMMENDED_SCREENERS } from '@/lib/screeners'

import { ColumnViewPresetManager } from '@/components/molecules/table/ColumnViewPresetManager'

const periods = [
  { label: '1 jour', value: '1d' },
  { label: '1 semaine', value: '1w' },
  { label: '1 mois', value: '1m' },
  { label: '3 mois', value: '3m' },
  { label: '6 mois', value: '6m' },
  { label: '1 an', value: '1y' },
  { label: '5 ans', value: '5y' },
]

interface TableContextHeaderProps {
  table: Table<any>
  id: string
  owned: boolean
  setData: (data: { name: string; securities: any[] }) => void
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  allAvailableTags?: string[]
  showMetrics?: boolean
  setShowMetrics?: (val: boolean) => void
  activeScreener?: string | null
  setActiveScreener?: (screenerId: string | null) => void
}

export const TableContextHeader = ({
  table,
  id,
  owned,
  setData,
  selectedPeriod,
  setSelectedPeriod,
  allAvailableTags = [],
  showMetrics,
  setShowMetrics,
  activeScreener = null,
  setActiveScreener,
}: TableContextHeaderProps) => {
  const [showFilters, setShowFilters] = React.useState(false)

  const addRow = async (symbol: string) => {
    const response = await watchListService.addStock(id, {
      security: {
        symbol: symbol,
        date: new Date(),
      },
    })
    setData({
      name: response!.name,
      securities: response!.securities,
    })
  }

  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
  const hasActiveFilter = isFiltered || !!activeScreener

  return (
    <div className="flex flex-col gap-2 p-2 sm:gap-4 sm:p-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-1 items-center gap-2">
          {owned && <AddStockButton addRow={addRow} />}

          <div className="relative w-full max-w-sm sm:w-auto">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol..."
              value={(table.getState().globalFilter as string) ?? ''}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="h-8 w-full pl-8 text-xs sm:w-[250px]"
            />
          </div>

          <Button
            variant={showFilters ? 'default' : hasActiveFilter ? 'outline' : 'outline'}
            size="sm"
            className={cn(
              'h-8 gap-1.5 rounded-full text-xs font-bold transition-all border border-border/70',
              showFilters
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : hasActiveFilter
                ? 'bg-primary/10 text-primary border-primary/40'
                : 'bg-background text-foreground hover:bg-muted'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filtres</span>
            {hasActiveFilter && (
              <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.2 text-[10px] font-bold">
                {table.getState().columnFilters.length + (activeScreener ? 1 : 0)}
              </span>
            )}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform duration-200', showFilters && 'rotate-180')}
            />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Unified Column View & Preset Manager */}
          <ColumnViewPresetManager table={table} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 whitespace-nowrap">
                {periods.find((p) => p.value === selectedPeriod)?.label || 'Sélectionner'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {periods.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p.value}
                  className="capitalize"
                  checked={p.value === selectedPeriod}
                  onCheckedChange={() => setSelectedPeriod(p.value)}
                >
                  {p.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden text-sm text-muted-foreground md:block">
            {table.getRowModel().rows.length} actions
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-md border-border/70 transition-all duration-200 animate-in fade-in zoom-in-95">
          {/* SECTION 1: FILTRES RECOMMANDÉS / SCREENERS */}
          {setActiveScreener && (
            <div className="flex flex-col gap-2 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Filtres Recommandés
                </span>
                {activeScreener && (
                  <button
                    onClick={() => setActiveScreener(null)}
                    className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Réinitialiser le screener</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {RECOMMENDED_SCREENERS.map((scr) => {
                  const isActive = activeScreener === scr.id
                  return (
                    <button
                      key={scr.id}
                      onClick={() => setActiveScreener(isActive ? null : scr.id)}
                      title={scr.desc}
                      aria-pressed={isActive}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all border',
                        isActive
                          ? 'bg-primary border-primary text-primary-foreground shadow-xs ring-2 ring-primary/20'
                          : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      <span>{scr.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: FILTRES PAR COLONNE */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" /> Filtres par Colonne
              </span>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    table.resetColumnFilters()
                    table.resetGlobalFilter()
                    if (setActiveScreener) setActiveScreener(null)
                  }}
                  className="h-7 px-2 text-xs font-semibold text-destructive hover:text-destructive/80"
                >
                  Tout réinitialiser
                  <XCircleIcon className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {table.getColumn('hasFundamentals') && (
                <DataTableFacetedFilter
                  column={table.getColumn('hasFundamentals')}
                  title="Fondamentaux"
                  options={[
                    { label: 'Disponible', value: 'yes' },
                    { label: 'Non disponible', value: 'no' },
                  ]}
                />
              )}

              {table.getColumn('sector') && (
                <DataTableFacetedFilter
                  column={table.getColumn('sector')}
                  title="Secteur"
                  options={sectors}
                />
              )}

              {table.getColumn('industry') && (
                <DataTableFacetedFilter
                  column={table.getColumn('industry')}
                  title="Industrie"
                  options={industries}
                />
              )}

              {table.getColumn('tags') && allAvailableTags.length > 0 && (
                <DataTableFacetedFilter
                  column={table.getColumn('tags')}
                  title="Tags"
                  options={allAvailableTags.map((tag) => ({ label: tag, value: tag }))}
                />
              )}

              {/* Numerical Range Filters */}
              {table.getColumn('trailingPE') && (
                <DataTableRangeFilter
                  column={table.getColumn('trailingPE')}
                  title="P/E"
                  step={1}
                  presets={[
                    { label: '< 15 (Value)', max: 15 },
                    { label: '15 - 25 (Fair)', min: 15, max: 25 },
                    { label: '> 25 (Growth)', min: 25 },
                  ]}
                />
              )}

              {table.getColumn('forwardPE') && (
                <DataTableRangeFilter
                  column={table.getColumn('forwardPE')}
                  title="P/E Fwd"
                  step={1}
                  presets={[
                    { label: '< 15', max: 15 },
                    { label: '15 - 25', min: 15, max: 25 },
                    { label: '> 25', min: 25 },
                  ]}
                />
              )}

              {table.getColumn('pe5y') && (
                <DataTableRangeFilter
                  column={table.getColumn('pe5y')}
                  title="P/E (5a)"
                  step={1}
                  presets={[
                    { label: '< 15', max: 15 },
                    { label: '15 - 25', min: 15, max: 25 },
                    { label: '> 25', min: 25 },
                  ]}
                />
              )}

              {table.getColumn('dividendYield') && (
                <DataTableRangeFilter
                  column={table.getColumn('dividendYield')}
                  title="Yield"
                  unit="%"
                  step={0.5}
                  presets={[
                    { label: '> 4%', min: 4 },
                    { label: '2% - 4%', min: 2, max: 4 },
                    { label: '< 2%', max: 2 },
                  ]}
                />
              )}

              {table.getColumn('roic') && (
                <DataTableRangeFilter
                  column={table.getColumn('roic')}
                  title="ROIC (5a)"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 20%', min: 20 },
                    { label: '> 15%', min: 15 },
                    { label: '> 10%', min: 10 },
                  ]}
                />
              )}

              {table.getColumn('roa') && (
                <DataTableRangeFilter
                  column={table.getColumn('roa')}
                  title="ROA"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 15%', min: 15 },
                    { label: '> 5%', min: 5 },
                  ]}
                />
              )}

              {table.getColumn('roe') && (
                <DataTableRangeFilter
                  column={table.getColumn('roe')}
                  title="ROE"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 20%', min: 20 },
                    { label: '> 15%', min: 15 },
                    { label: '> 10%', min: 10 },
                  ]}
                />
              )}

              {table.getColumn('growth') && (
                <DataTableRangeFilter
                  column={table.getColumn('growth')}
                  title="Croissance CA"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 20%', min: 20 },
                    { label: '10% - 20%', min: 10, max: 20 },
                    { label: '< 10%', max: 10 },
                  ]}
                />
              )}

              {table.getColumn('revGrowth') && (
                <DataTableRangeFilter
                  column={table.getColumn('revGrowth')}
                  title="Croissance CA (5a)"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 20%', min: 20 },
                    { label: '10% - 20%', min: 10, max: 20 },
                    { label: '< 10%', max: 10 },
                  ]}
                />
              )}

              {table.getColumn('linearity10y') && (
                <DataTableRangeFilter
                  column={table.getColumn('linearity10y')}
                  title="Linéarité"
                  unit="%"
                  step={5}
                  presets={[
                    { label: '> 90%', min: 90 },
                    { label: '> 70%', min: 70 },
                  ]}
                />
              )}

              {table.getColumn('ret_lin') && (
                <DataTableRangeFilter
                  column={table.getColumn('ret_lin')}
                  title="Score (Ret×Lin)"
                  unit="%"
                  step={5}
                />
              )}

              {table.getColumn('variation') && (
                <DataTableRangeFilter
                  column={table.getColumn('variation')}
                  title="Var. (%)"
                  unit="%"
                  step={0.5}
                  presets={[
                    { label: 'Positive (> 0%)', min: 0 },
                    { label: 'Négative (< 0%)', max: 0 },
                  ]}
                />
              )}

              {table.getColumn('cagr5y') && (
                <DataTableRangeFilter
                  column={table.getColumn('cagr5y')}
                  title="TCAC 5a"
                  unit="%"
                  step={1}
                  presets={[
                    { label: '> 15%', min: 15 },
                    { label: '> 10%', min: 10 },
                  ]}
                />
              )}

              {table.getColumn('regularMarketPrice') && (
                <DataTableRangeFilter column={table.getColumn('regularMarketPrice')} title="Prix" step={1} />
              )}

              {table.getColumn('marketCap') && (
                <DataTableRangeFilter column={table.getColumn('marketCap')} title="Cap. Boursière" step={1000000} />
              )}

              {table.getColumn('weight') && (
                <DataTableRangeFilter column={table.getColumn('weight')} title="Pondération" unit="%" step={1} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

