'use client'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddStockButton } from './AddStockButton'
import { Button } from '@/components/ui/button'
import { ChevronDown, Cross, XCircleIcon } from 'lucide-react'
import watchListService from '@/services/watchListService'
import { DataTableFacetedFilter } from './data-table-filter'
import { industries, sectors } from '../data/data'

const periods = ['1j', '1s', '1m', '3m', '1y', '5y']

interface TableContextHeaderProps {
  table: any
  id: string
  owned: boolean
  setData: (data: { name: string; securities: any[] }) => void
}

export const TableContextHeader = ({ table, id, owned, setData }: TableContextHeaderProps) => {
  const addRow = async (symbol: string) => {
    const response = await watchListService.addStock(id, {
      symbol: symbol,
      date: new Date(),
    })
    setData({
      name: response!.name,
      securities: response!.securities,
    })
  }

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-wrap gap-2">
        {owned && <AddStockButton addRow={addRow} />}
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

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 text-sm lg:px-3"
          >
            Supprimer les filtres
            <XCircleIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 whitespace-nowrap">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
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
              Périodes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {periods.map((p) => {
              return (
                <DropdownMenuCheckboxItem key={p} className="capitalize">
                  {p}
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
