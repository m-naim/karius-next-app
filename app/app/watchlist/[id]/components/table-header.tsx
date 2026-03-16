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
import { industries, sectors } from '../data/data'
import { T } from 'framer-motion/dist/types.d-B50aGbjN'
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
}

export const TableContextHeader = ({
  table,
  id,
  owned,
  setData,
  selectedPeriod,
  setSelectedPeriod,
  allAvailableTags = [],
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
    <div className="flex flex-col gap-4 p-4 sm:gap-6">
      <div className="flex items-center justify-between gap-4">
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

          <div className="hidden text-sm text-muted-foreground md:block">
            {table.getRowModel().rows.length} actions
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/5 p-2 transition-all">
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

          {table.getColumn('trailingPE') && (
            <DataTableFacetedFilter
              column={table.getColumn('trailingPE')}
              title="P/E"
              options={[
                { label: 'Value (< 15)', value: 'value' },
                { label: 'Fair (15-25)', value: 'fair' },
                { label: 'Growth (> 25)', value: 'growth' },
              ]}
            />
          )}

          {table.getColumn('dividendYield') && (
            <DataTableFacetedFilter
              column={table.getColumn('dividendYield')}
              title="Yield"
              options={[
                { label: 'High (> 4%)', value: 'high' },
                { label: 'Medium (2-4%)', value: 'medium' },
                { label: 'Low (< 2%)', value: 'low' },
              ]}
            />
          )}

          {table.getColumn('growth') && (
            <DataTableFacetedFilter
              column={table.getColumn('growth')}
              title="Growth"
              options={[
                { label: 'Hyper (> 20%)', value: 'hyper' },
                { label: 'Steady (10-20%)', value: 'steady' },
                { label: 'Slow (< 10%)', value: 'slow' },
              ]}
            />
          )}

          {table.getColumn('roa') && (
            <DataTableFacetedFilter
              column={table.getColumn('roa')}
              title="ROA"
              options={[
                { label: 'High (> 15%)', value: 'high' },
                { label: 'Good (5-15%)', value: 'good' },
                { label: 'Low (< 5%)', value: 'low' },
              ]}
            />
          )}

          {table.getColumn('roe') && (
            <DataTableFacetedFilter
              column={table.getColumn('roe')}
              title="ROE"
              options={[
                { label: 'High (> 15%)', value: 'high' },
                { label: 'Good (5-15%)', value: 'good' },
                { label: 'Low (< 5%)', value: 'low' },
              ]}
            />
          )}

          {table.getColumn('linearity10y') && (
            <DataTableFacetedFilter
              column={table.getColumn('linearity10y')}
              title="Linearity"
              options={[
                { label: 'High (> 90%)', value: 'high' },
                { label: 'Good (70-90%)', value: 'good' },
                { label: 'Low (< 70%)', value: 'low' },
              ]}
            />
          )}

          {table.getColumn('variation') && (
            <DataTableFacetedFilter
              column={table.getColumn('variation')}
              title="Performance"
              options={[
                { label: 'Positive', value: 'positive' },
                { label: 'Negative', value: 'negative' },
                { label: 'Flat', value: 'flat' },
              ]}
            />
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
