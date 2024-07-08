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

import { columns } from './columns'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import { TableContextHeader } from './table-header'
import { security } from '../data/security'

export function WatchlistTable({ securities, id }: { securities: security[]; id: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable<security>({
    data: securities,
    columns: columns(id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    securities != null && (
      <div className="w-full">
        <TableContextHeader table={table} id={id} />
        <SimpleDataTable table={table} colSpan={columns.length} />
      </div>
    )
  )
}
