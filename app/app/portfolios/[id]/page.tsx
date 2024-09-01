'use client'

import { usePathname } from 'next/navigation'
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
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { FileScan } from 'lucide-react'
import TransactionDialogue from './transactionDialogue'
import Link from 'next/link'
import { AddTransaction, get, addMouvementService } from '@/services/portfolioService'
import { v4 as uuidv4 } from 'uuid'
import StatsCard from './statsCard'
import AccountsMouvements from './accountsMouvements'
import Loader from '@/components/molecules/loader/loader'

export default function PortfolioView() {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const [portfolio, setPortfolio] = useState({
    _id: '',
    allocation: [],
    transactions: [],
    cashValue: 0,
    totalValue: 0,
  })
  const [own, setOwn] = React.useState(false)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const res = await get(id as string)
        setOwn(res.own)
        setPortfolio(res.data)
        setData(res.data.allocation)
        setLoading(false)
      } catch (e) {
        console.error('error api:' + e)
        setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0, totalValue: 0 })
        setLoading(false)
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

  const addTransaction = async (transactionData) => {
    setLoading(true)
    transactionData.id = uuidv4()
    const res = await AddTransaction(id, transactionData)
    setOwn(res.own)
    setPortfolio(res.data)
    setData(res.data.allocation)
    setLoading(false)
    return res
  }

  const addMouvement = async (data) => {
    setLoading(true)
    data.id = uuidv4()
    const res = await addMouvementService(id, data)
    setOwn(res.own)
    setPortfolio(res.data)
    setData(res.data.allocation)
    setLoading(false)
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="mb-20 flex w-full flex-wrap-reverse gap-1">
      <Card className="w-full flex-grow  lg:w-8/12">
        <CardHeader>
          <CardTitle>Investissements</CardTitle>
          {own && (
            <div className="flex gap-2 p-2">
              <AccountsMouvements
                data-umami-event="portfolio-accounts-mouvements-button"
                Trigger={() => (
                  <Button variant="outline" size="sm">
                    Dépôt / retrait
                  </Button>
                )}
                submitHandler={addMouvement}
              />

              <TransactionDialogue
                data-umami-event="portfolio-add-transaction-button"
                Trigger={() => (
                  <Button variant="outline" size="sm">
                    + Acheter / Vendre
                  </Button>
                )}
                totalPortfolioValue={portfolio.totalValue}
                submitHandler={addTransaction}
              />

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
          <div className="grid grid-cols-4 pl-2 pt-2">
            <div className="pl-2">Espèces</div>
            <div className="pl-12">{portfolio.cashValue}</div>
          </div>
        </CardContent>
      </Card>
      <div className="w-fill flex flex-grow  flex-col gap-2 ">
        <StatsCard pftData={portfolio} />
      </div>
    </div>
  )
}
