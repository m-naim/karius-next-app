'use client'

import * as React from 'react'

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { columns } from './columns'

import { useLayoutEffect } from 'react'
import watchListService from 'services/watchListService'
import { AddStockButton } from './AddStockButton'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'

export type security = {
  exchange: string
  shortname: string
  quoteType: string
  symbol: string
  longname: string
  sector: string
  industry: string
}

const periods = ['1j', '1s', '1m', '3m', '1y', '5y']

export function WatchlistTable() {
  const [data, setData] = React.useState([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  let watchlistData

  const fetchData = async () => {
    const initData = await watchListService.get('6209837d1dac3662c006190a')
    console.log(initData);
    
    setData(initData?.securities)
    return initData
  }

  useLayoutEffect(() => {
    watchlistData = fetchData()
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <h2>{watchlistData?.name}</h2>
      <TableContextHeader table={table} setData={setData} />
      <SimpleDataTable table={table} colSpan={columns.length} />
    </div>
  )
}

const TableContextHeader = ({ table, setData }) => {
  const addRow = (newRow) => {
    console.log(newRow)
    const setFunc = (old) => [...old, newRow]
    setData(setFunc)
    watchListService.addStock('6209837d1dac3662c006190a', {
      symbol: newRow.symbol,
      date: '2024-01-06',
    })
  }

  return (
    <div className="flex items-center justify-end py-4">
      <AddStockButton addRow={addRow} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-1">
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
          <Button variant="outline" className="ml-1">
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
  )
}
