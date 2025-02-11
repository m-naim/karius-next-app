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

export const TableContextHeader = ({ table, id, owned, setData }) => {
  const addRow = async (symbol) => {
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
    <div className="flex w-full justify-between gap-10 py-4">
      <div className="flex gap-2">
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
            className="h-8 px-2 lg:px-3"
          >
            supprimer les filter
            <XCircleIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="ml-1">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
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
            <Button size="sm" variant="outline" className="ml-1">
              Periods <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {periods.map((p) => {
              return (
                <DropdownMenuCheckboxItem
                  key={p}
                  className="capitalize"
                  // onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
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
