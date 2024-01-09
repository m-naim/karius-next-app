'use client'

import { usePathname } from 'next/navigation'
import PortfolioLayout from 'app/app/portfolios/[id]/PortfolioLayout'
import React, { useState, useEffect } from 'react'
import portfolioService from '@/services/portfolioService'

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

// const columns=['symbol','weight','qty','last','bep']

function PortfolioView({ children, to }) {
  const id = usePathname().split('/')[3]
  const [data, setData] = React.useState([])
  const [portfolio, setPortfolio] = useState({ _id: '', allocation: [], transactions: [] })
  const [editable, setEditable] = useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchData = async (id) => {
    try {
      console.log(id)
      const res = await portfolioService.get(id as string)
      // const userId= authService.getCurrentUser().user.id;

      res.allocation = res.allocation.map((item, i) => {
        item.id = i + 1
        return item
      })

      res.transactions.forEach((item, i) => {
        item.id = i + 1
      })
      // if(data.owner===userId) setEditable(true);
      console.log(res)
      setPortfolio(res)
      setData(res.allocation)
    } catch (e) {
      console.log('error api:' + e)
      setPortfolio({ _id: '', allocation: [], transactions: [] })
    }
  }

  useEffect(() => {
    fetchData(id)
  }, [])

  const addtransaction = async (sense, ticker, prix, qty, date) => {
    const res = await portfolioService.AddTransaction(portfolio._id, sense, ticker, prix, qty, date)
    console.log(res)
    res.allocation = res.allocation.map((item, i) => {
      item.id = i + 1
      return item
    })

    res.transactions.forEach((item, i) => {
      item.id = i + 1
    })

    setPortfolio(res)
  }

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
    <PortfolioLayout pftData={portfolio}>
      <SimpleDataTable table={table} colSpan={columns.length} />
    </PortfolioLayout>
  )
}

export default PortfolioView
