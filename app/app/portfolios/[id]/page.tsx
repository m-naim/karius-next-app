'use client'

import { usePathname } from 'next/navigation'
import React, { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { columns, PortfolioSecurity } from './columns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  FileScan,
  PlusIcon,
  WalletMinimal,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import TransactionDialogue from './transactionDialogue'
import Link from 'next/link'
import {
  AddTransaction,
  get,
  addMouvementService,
  initPortfolioSSE,
} from '@/services/portfolioService'
import { v4 as uuidv4 } from 'uuid'
import StatsCard from './statsCard'
import AccountsMouvements from './accountsMouvements'
import Loader from '@/components/molecules/loader/loader'
import { round10 } from '@/lib/decimalAjustement'
import AllocationPie from './allocationPie'
import PortfolioTable from '@/components/molecules/table/PortfolioTable'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export default function PortfolioView() {
  const id = usePathname().split('/')[3]
  const { toast } = useToast()
  const [data, setData] = React.useState<PortfolioSecurity[]>([])
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
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    symbol: true,
    weight: true,
    last: true,
    bep: true,
    retour: true,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')
  let eventSource: EventSource | null = null

  const useDynamicColumns = () =>
    useMemo(() => {
      return columns(selectedPeriod)
    }, [selectedPeriod])

  const fetchData = async (id: string) => {
    try {
      const res = await get(id)
      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
      setLoading(false)
    } catch (e) {
      console.error('error api:', e)
      setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0, totalValue: 0 })
      setLoading(false)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du portfolio',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchData(id)
    const es = initPortfolioSSE(id)
    eventSource = es
    eventSource.addEventListener('portfolio', (event) => {
      const eventData = JSON.parse(event.data)
      setPortfolio(eventData)
      setData(eventData.allocation)
    })
    return () => {
      eventSource?.close()
    }
  }, [id])

  const table = useReactTable({
    data,
    columns: useDynamicColumns(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const addTransaction = async (transactionData) => {
    setLoading(true)
    try {
      transactionData.id = uuidv4()
      const res = await AddTransaction(id, transactionData)
      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
      toast({
        title: 'Transaction ajoutée',
        description: 'Votre transaction a été enregistrée avec succès',
      })
      return res
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'ajout de la transaction",
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addMouvement = async (data) => {
    setLoading(true)
    try {
      data.id = uuidv4()
      const res = await addMouvementService(id, data)
      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
      toast({
        title: 'Mouvement ajouté',
        description: 'Le mouvement a été enregistré avec succès',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'ajout du mouvement",
        variant: 'destructive',
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="flex w-full flex-wrap-reverse gap-6">
      <div className="w-full flex-grow lg:w-8/12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Investissements</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{data.length} actifs détenus</span>
              <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
                {['1w', '1m', '1y', '5y'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={cn(
                      'rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-all',
                      selectedPeriod === p
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {own && (
            <div className="flex items-center gap-2">
              <AccountsMouvements
                submitHandler={addMouvement}
                Trigger={() => (
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <WalletMinimal className="h-4 w-4" />
                    <span>Espèces</span>
                  </Button>
                )}
              />
              <TransactionDialogue
                totalPortfolioValue={portfolio.totalValue}
                submitHandler={addTransaction}
                Trigger={() => (
                  <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20">
                    <PlusIcon className="h-4 w-4" />
                    <span>Transaction</span>
                  </Button>
                )}
              />
              <Link href={`${id}/import`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 border">
                  <FileScan className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gray-50/30 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou symbole..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-9 bg-background pl-9"
                />
              </div>
              <div className="hidden flex-1 items-center justify-end gap-4 text-xs sm:flex">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Cash :</span>
                  <span className="font-semibold text-foreground">
                    {round10(portfolio.cashValue, -2).toLocaleString()} €
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <WalletMinimal className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Aucun investissement</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Commencez par ajouter votre premier actif ou importez un fichier.
                </p>
                <div className="mt-6 flex gap-3">
                  <TransactionDialogue
                    Trigger={() => (
                      <Button size="sm" className="gap-2">
                        <PlusIcon className="h-4 w-4" />
                        Ajouter un actif
                      </Button>
                    )}
                    totalPortfolioValue={portfolio.totalValue}
                    submitHandler={addTransaction}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`${id}/import`}>Importer</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <PortfolioTable table={table} colSpan={columns.length} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-fill flex flex-grow flex-col gap-6 lg:max-w-xs">
        <StatsCard pftData={portfolio} />
        {data.length > 0 && (
          <Card className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="px-4 py-3">
              <h3 className="text-sm font-semibold">Répartition</h3>
            </CardHeader>
            <CardContent className="p-4">
              <AllocationPie data={data} totalValue={portfolio.totalValue} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
