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
import { ChevronDown, Cross, Filter, Search, Settings2, XCircleIcon } from 'lucide-react'
import watchListService from '@/services/watchListService'
import { DataTableFacetedFilter } from './data-table-filter'
import { DataTableRangeFilter } from './data-table-range-filter'
import { industries, sectors } from '../data/data'
import { Table } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

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
            variant="outline"
            size="sm"
            className={cn('h-8 gap-1', showFilters && 'bg-muted')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Colonnes</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

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

          {setShowMetrics && (
            <Button
              size="sm"
              variant={showMetrics ? "default" : "outline"}
              className="h-8 whitespace-nowrap"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              Metrics 5A
            </Button>
          )}

          <div className="hidden text-sm text-muted-foreground md:block">
            {table.getRowModel().rows.length} actions
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/5 p-2 transition-all">
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
            <DataTableRangeFilter column={table.getColumn('trailingPE')} title="P/E" step={1} />
          )}

          {table.getColumn('forwardPE') && (
            <DataTableRangeFilter column={table.getColumn('forwardPE')} title="P/E Fwd" step={1} />
          )}

          {table.getColumn('pe5y') && (
            <DataTableRangeFilter column={table.getColumn('pe5y')} title="P/E (5a)" step={1} />
          )}

          {table.getColumn('dividendYield') && (
            <DataTableRangeFilter column={table.getColumn('dividendYield')} title="Yield" unit="%" step={0.5} />
          )}

          {table.getColumn('roic') && (
            <DataTableRangeFilter column={table.getColumn('roic')} title="ROIC (5a)" unit="%" step={1} />
          )}

          {table.getColumn('roa') && (
            <DataTableRangeFilter column={table.getColumn('roa')} title="ROA" unit="%" step={1} />
          )}

          {table.getColumn('roe') && (
            <DataTableRangeFilter column={table.getColumn('roe')} title="ROE" unit="%" step={1} />
          )}

          {table.getColumn('growth') && (
            <DataTableRangeFilter column={table.getColumn('growth')} title="Croissance CA" unit="%" step={1} />
          )}

          {table.getColumn('revGrowth') && (
            <DataTableRangeFilter column={table.getColumn('revGrowth')} title="Croissance CA (5a)" unit="%" step={1} />
          )}

          {table.getColumn('linearity10y') && (
            <DataTableRangeFilter column={table.getColumn('linearity10y')} title="Linéarité" unit="%" step={5} />
          )}

          {table.getColumn('ret_lin') && (
            <DataTableRangeFilter column={table.getColumn('ret_lin')} title="Score (Ret×Lin)" unit="%" step={5} />
          )}

          {table.getColumn('variation') && (
            <DataTableRangeFilter column={table.getColumn('variation')} title="Var. (%)" unit="%" step={0.5} />
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

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters()
                table.resetGlobalFilter()
              }}
              className="h-8 px-2 text-sm lg:px-3"
            >
              Supprimer les filtres
              <XCircleIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
