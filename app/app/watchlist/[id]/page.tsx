'use client'

import React, { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import watchListService from '@/services/watchListService'
import { security } from './data/security'
import { TableContextHeader } from './components/table-header'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { columns } from './components/columns'

interface watchList {
  name: string
  securities: security[]
}

export default function Watchlist() {
  const id = usePathname().split('/')[3]
  const [data, setData] = React.useState<watchList>({
    name: '',
    securities: [],
  })
  const [owned, setOwned] = React.useState(false)
  const [loading, setloading] = React.useState(true)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable<security>({
    data: data!.securities,
    columns: columns(id, owned),
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

  const fetchData = async () => {
    const response = await watchListService.get(id)
    setData(response.watchlist)
    setOwned(response.owned)
    setloading(false)
  }

  useLayoutEffect(() => {
    fetchData()
  }, [])

  return loading ? (
    <div>loading ...</div>
  ) : (
    <>
      <SectionContainer>
        <div>
          <h1>{data?.name}</h1>
        </div>
      </SectionContainer>
      <SectionContainer>
        {!loading && data!.securities != null && (
          <div className="w-full">
            <TableContextHeader table={table} id={id} owned={owned} />
            <SimpleDataTable table={table} colSpan={columns.length} />
          </div>
        )}
      </SectionContainer>
    </>
  )
}
