'use client'

import { usePathname } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'

import { Card, CardContent } from '@/components/ui/card'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import React, { useEffect, useState } from 'react'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { get } from '@/services/portfolioService'
import { columns } from './columns'

function PageTransactions() {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])

  const [own, setOwn] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchData = async (id) => {
    try {
      const res = await get(id as string)
      console.log(res)

      setOwn(res.own)
      setData(res.data.transactions)
    } catch (e) {
      console.error('error api:' + e)
    }
  }

  useEffect(() => {
    fetchData(id)
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
    <div>
      <SectionContainer>
        <Card>
          <CardContent>
            <SimpleDataTable table={table} colSpan={columns.length} />
          </CardContent>
        </Card>
      </SectionContainer>
    </div>
  )
}

export default PageTransactions
