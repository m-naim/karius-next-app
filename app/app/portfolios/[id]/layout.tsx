'use client'

import { usePathname } from 'next/navigation'
import PortfolioLayout from 'app/app/portfolios/[id]/PortfolioLayout'
import React, { useState, useEffect } from 'react'

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

import { get } from '@/services/portfolioService'

export default function PortfolioView({ children }) {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])
  const [portfolio, setPortfolio] = useState({
    _id: '',
    allocation: [],
    transactions: [],
    cashValue: 0,
  })
  const [own, setOwn] = React.useState(false)
  const [followed, setFollowed] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const res = await get(id as string)
        setOwn(res.own)
        setFollowed(res.followed)
        setPortfolio(res.data)
        setData(res.data.allocation)
      } catch (e) {
        console.error('error api:' + e)
        setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0 })
      }
    }
    fetchData(id)
  }, [id])

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
      <PortfolioLayout
        id={id}
        setPftData={setPortfolio}
        pftData={portfolio}
        isOwn={own}
        followed={followed}
        setFollowed={setFollowed}
      >
        {children}
      </PortfolioLayout>
    </div>
  )
}
