'use client'

import { usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
import React, { useEffect, useState, useMemo } from 'react'
import {
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  deleteTransaction,
  getTransactions,
  modifyTransactionApi,
} from '@/services/portfolioService'
import { columns as transactionColumns } from './columns'
import { MovementsColumns } from './movementsColumns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, History, ArrowLeftRight, Wallet, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Loader from '@/components/molecules/loader/loader'

function PageTransactions() {
  const id = usePathname().split('/')[3]
  const [data, setData] = useState([])
  const [movements, setMovements] = useState([])
  const [own, setOwn] = useState(false)
  const [loading, setLoading] = useState(true)

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState('transactions')
  const [selectedYear, setSelectedYear] = useState('all')

  const modifyTransactionHandler = async (updateData) => {
    const res = await modifyTransactionApi(id, updateData)
    setData(res.data.transactions)
  }

  const deleteTransactionHandler = async (idTransaction) => {
    const res = await deleteTransaction(id, idTransaction)
    setData(res.data.transactions)
  }

  useEffect(() => {
    const fetchData = async (portfolioId: string) => {
      try {
        setLoading(true)
        const res = await getTransactions(portfolioId)
        setOwn(res.own)
        setData(res.transactions || [])
        setMovements(res.cash_flow || [])
      } catch (e) {
        console.error('error api:' + e)
      } finally {
        setLoading(false)
      }
    }
    fetchData(id)
  }, [id])

  // Extraction des années disponibles
  const availableYears = useMemo(() => {
    const years = new Set<string>()
    data.forEach((t: any) => {
      if (t.date) years.add(new Date(t.date).getFullYear().toString())
    })
    movements.forEach((m: any) => {
      if (m.date) years.add(new Date(m.date).getFullYear().toString())
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [data, movements])

  // Filtrage par année
  const filteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return data
    return data.filter((t: any) => new Date(t.date).getFullYear().toString() === selectedYear)
  }, [data, selectedYear])

  const filteredMovements = useMemo(() => {
    if (selectedYear === 'all') return movements
    return movements.filter((m: any) => new Date(m.date).getFullYear().toString() === selectedYear)
  }, [movements, selectedYear])

  const transactionsTable = useReactTable({
    data: filteredTransactions,
    columns: transactionColumns(id, own, modifyTransactionHandler, deleteTransactionHandler),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const movementsTable = useReactTable({
    data: filteredMovements,
    columns: MovementsColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const stats = useMemo(() => {
    const totalInvested = filteredTransactions
      .filter((t: any) => t.qty > 0)
      .reduce((acc, t: any) => acc + t.price * t.qty, 0)
    const totalSold = filteredTransactions
      .filter((t: any) => t.qty < 0)
      .reduce((acc, t: any) => acc + t.price * Math.abs(t.qty), 0)
    const netMovements = filteredMovements.reduce((acc, m: any) => acc + m.amount, 0)

    return { totalInvested, totalSold, netMovements }
  }, [filteredTransactions, filteredMovements])

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Activité</h1>
          <p className="text-sm text-muted-foreground">
            Historique complet de vos transactions et flux de trésorerie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Année :
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Toutes les années" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ArrowLeftRight className="h-3 w-3" />
              Investi ({selectedYear === 'all' ? 'Total' : selectedYear})
            </div>
            <div className="mt-1 text-xl font-bold">{stats.totalInvested.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <ArrowLeftRight className="h-3 w-3 rotate-180" />
              Vendu ({selectedYear === 'all' ? 'Total' : selectedYear})
            </div>
            <div className="mt-1 text-xl font-bold">{stats.totalSold.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Wallet className="h-3 w-3" />
              Flux Net Cash ({selectedYear === 'all' ? 'Total' : selectedYear})
            </div>
            <div className="mt-1 text-xl font-bold">{stats.netMovements.toLocaleString()} €</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="transactions" className="gap-2 px-4">
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-2 px-4">
              <Wallet className="h-4 w-4" />
              Flux Cash
            </TabsTrigger>
          </TabsList>

          {activeTab === 'transactions' && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrer par symbole..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 bg-background pl-9"
              />
            </div>
          )}
        </div>

        <TabsContent value="transactions" className="mt-4 border-none p-0">
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <SimpleDataTable table={transactionsTable} colSpan={transactionColumns.length} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-4 border-none p-0">
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <SimpleDataTable table={movementsTable} colSpan={MovementsColumns.length} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PageTransactions
