'use client'

import { usePathname } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
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
import { deleteTransaction, get, modifyTransactionApi } from '@/services/portfolioService'
import { columns } from './columns'
import { MovementsColumns } from './movementsColumns'

function PageTransactions() {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])

  const [movements, setMovements] = React.useState([])

  const [own, setOwn] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'date', desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const modifyTransactionHandler = async (data) => {
    const res = await modifyTransactionApi(id, data)
    setData(res.data.transactions)
  }

  const deleteTransactionHandler = async (idTransaction) => {
    const res = await deleteTransaction(id, idTransaction)
    setData(res.data.transactions)
  }

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const res = await get(id as string)
        setOwn(res.own)
        setData(res.data.transactions)
        setMovements(res.data.cash_flow)
      } catch (e) {
        console.error('error api:' + e)
      }
    }
    fetchData(id)
  }, [id])

  const trasactionsTable = useReactTable({
    data,
    columns: columns(id, own, modifyTransactionHandler, deleteTransactionHandler),
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

  const movementsTable = useReactTable({
    data: movements,
    columns: MovementsColumns,
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
    <div className="flex flex-col gap-4">
      <SectionContainer className="w-full">
        <Card className="w-full p-4">
          <CardTitle>Operations</CardTitle>
          <CardContent>
            <SimpleDataTable table={movementsTable} colSpan={columns.length} />
          </CardContent>
        </Card>
      </SectionContainer>

      <SectionContainer className="w-full">
        <Card className="w-full  p-4">
          <CardTitle>Transactions</CardTitle>
          <CardContent>
            <SimpleDataTable table={trasactionsTable} colSpan={columns.length} />
          </CardContent>
        </Card>
      </SectionContainer>
    </div>
  )
}

export default PageTransactions
