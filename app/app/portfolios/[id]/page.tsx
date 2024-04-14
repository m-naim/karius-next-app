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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { FileScan } from 'lucide-react'
import TransactionDialogue from './transactionDialogue'
import Link from 'next/link'

export default function PortfolioView() {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])
  const [portfolio, setPortfolio] = useState({ _id: '', allocation: [], transactions: [] })
  const [own, setOwn] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchData = async (id) => {
    try {
      const res = await portfolioService.get(id as string)
      res.data.transactions.forEach((item, i) => {
        item.id = i + 1
      })

      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
    } catch (e) {
      console.error('error api:' + e)
      setPortfolio({ _id: '', allocation: [], transactions: [] })
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
    <PortfolioLayout id={id} pftData={portfolio} isOwn={own}>
      <Card>
        <CardHeader>
          <CardTitle>Investissements</CardTitle>
          {own && (
            <div className="flex gap-2 p-2">
              <TransactionDialogue id={id} />
              {/* <Button variant='outline'  size='sm'> visualiser</Button>
          <Button variant='outline'  size='sm'> all transactions</Button> */}
              <Link data-umami-event="portfolio-import-button" href={`${id}/import`}>
                <Button variant="outline" className="gap-2" size="sm">
                  <FileScan />
                  Importer
                </Button>
              </Link>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <SimpleDataTable table={table} colSpan={columns.length} />
        </CardContent>
      </Card>
    </PortfolioLayout>
  )
}
