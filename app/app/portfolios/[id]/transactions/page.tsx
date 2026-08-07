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
  getPaginationRowModel,
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
import { Search, History, Wallet, CalendarDays } from 'lucide-react'
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
    setData(res?.data?.transactions || [])
  }

  const deleteTransactionHandler = async (idTransaction) => {
    const res = await deleteTransaction(id, idTransaction)
    setData(res?.data?.transactions || [])
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
    ;(data || []).forEach((t: any) => {
      if (t.date) years.add(new Date(t.date).getFullYear().toString())
    })
    ;(movements || []).forEach((m: any) => {
      if (m.date) years.add(new Date(m.date).getFullYear().toString())
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [data, movements])

  // Filtrage par année
  const filteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return data || []
    return (data || []).filter((t: any) => new Date(t.date).getFullYear().toString() === selectedYear)
  }, [data, selectedYear])

  const filteredMovements = useMemo(() => {
    if (selectedYear === 'all') return movements || []
    return (movements || []).filter((m: any) => new Date(m.date).getFullYear().toString() === selectedYear)
  }, [movements, selectedYear])

  const transactionsTable = useReactTable({
    data: filteredTransactions,
    columns: transactionColumns(id, own, modifyTransactionHandler, deleteTransactionHandler),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const movementsTable = useReactTable({
    data: filteredMovements,
    columns: MovementsColumns,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const stats = useMemo(() => {
    const totalInvested = filteredTransactions
      .filter((t: any) => t.qty > 0)
      .reduce((acc, t: any) => acc + t.price * t.qty, 0)
    const totalSold = filteredTransactions
      .filter((t: any) => t.qty < 0)
      .reduce((acc, t: any) => acc + t.price * Math.abs(t.qty), 0)
    const netMovements = filteredMovements.reduce((acc, m: any) => acc + m.amount, 0)

    const allDates = [...filteredTransactions, ...filteredMovements]
      .map((t: any) => new Date(t.date).getTime())
      .filter(t => !isNaN(t))
    
    const firstTxDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : null
    
    let yearsActive = 1
    if (firstTxDate) {
       const now = new Date()
       yearsActive = Math.max(1, (now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    }
    
    const totalMovementsCount = filteredTransactions.length + filteredMovements.length
    const avgMovementsPerYear = totalMovementsCount > 0 ? Math.round(totalMovementsCount / yearsActive) : 0

    return { 
      totalInvested, 
      totalSold, 
      netMovements,
      firstTxDate: firstTxDate ? firstTxDate.toLocaleDateString('fr-FR') : 'N/A',
      avgMovementsPerYear
    }
  }, [filteredTransactions, filteredMovements])

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-4">
      {/* TOP SUMMARY STRIP (Distilled from 5 cards into 1 sleek horizontal bar) */}
      <div className="flex w-full items-center justify-between gap-3 sm:gap-6 py-2 px-3.5 sm:px-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-2xs overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-medium text-muted-foreground">Investi:</span>
          <span className="font-bold text-foreground tabular-nums">{stats.totalInvested.toLocaleString()} €</span>
        </div>
        <div className="h-3.5 w-px bg-border/60 shrink-0" />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-medium text-muted-foreground">Vendu:</span>
          <span className="font-bold text-foreground tabular-nums">{stats.totalSold.toLocaleString()} €</span>
        </div>
        <div className="h-3.5 w-px bg-border/60 shrink-0" />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-medium text-muted-foreground">Flux Cash:</span>
          <span className="font-bold text-foreground tabular-nums">{stats.netMovements.toLocaleString()} €</span>
        </div>
        <div className="h-3.5 w-px bg-border/60 shrink-0 hidden sm:block" />
        <div className="items-center gap-1.5 whitespace-nowrap hidden sm:flex">
          <span className="text-[11px] font-medium text-muted-foreground">Début:</span>
          <span className="font-bold text-foreground">{stats.firstTxDate}</span>
        </div>
        <div className="h-3.5 w-px bg-border/60 shrink-0 hidden md:block" />
        <div className="items-center gap-1.5 whitespace-nowrap hidden md:flex">
          <span className="text-[11px] font-medium text-muted-foreground">Moyenne:</span>
          <span className="font-bold text-foreground">{stats.avgMovementsPerYear} trans./an</span>
        </div>
      </div>

      {/* UNIFIED TABS & FILTERS HEADER */}
      <Tabs defaultValue="transactions" className="w-full space-y-3" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <TabsList className="h-8 bg-muted/60 p-0.5">
              <TabsTrigger value="transactions" className="gap-1.5 px-3 text-xs h-7">
                <History className="h-3.5 w-3.5" />
                Transactions ({filteredTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="movements" className="gap-1.5 px-3 text-xs h-7">
                <Wallet className="h-3.5 w-3.5" />
                Flux Cash ({filteredMovements.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {activeTab === 'transactions' && (
              <div className="relative flex-1 min-w-[140px] sm:w-[200px]">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-8 bg-background pl-8 text-xs border-border/70"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-[130px] bg-background text-xs border-border/70">
                  <SelectValue placeholder="Toutes années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes années</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="transactions" className="mt-2 border-none p-0">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <CardContent className="p-0">
              <SimpleDataTable table={transactionsTable} colSpan={transactionColumns.length} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="mt-2 border-none p-0">
          <Card className="overflow-hidden border-border bg-card shadow-sm">
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
