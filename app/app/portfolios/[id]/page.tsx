'use client'

import { usePathname } from 'next/navigation'
import React, { useState, useEffect, useMemo } from 'react'
import { useToast } from "@/hooks/use-toast"
import { debounce } from 'lodash'
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
import type { ButtonProps } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileScan, PlusIcon, WalletMinimal, RefreshCw } from 'lucide-react'
import TransactionDialogue from './transactionDialogue'
import Link from 'next/link'
import { AddTransaction, get, addMouvementService, getStockInfo } from '@/services/portfolioService'
import { v4 as uuidv4 } from 'uuid'
import StatsCard from './statsCard'
import AccountsMouvements from './accountsMouvements'
import Loader from '@/components/molecules/loader/loader'
import { round10 } from '@/lib/decimalAjustement'
import AllocationPie from './allocationPie'

type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface StockInfo {
  sector: string
  industry: string
}

interface AllocationItem {
  symbol: string
  weight: number
  total_value: number
  last: number
  qty: number
  bep: number
  retour: number
  sector?: string
  industry?: string
}

export default function PortfolioView() {
  const id = usePathname().split('/')[3]
  const { toast } = useToast()
  const [data, setData] = React.useState<AllocationItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({})

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
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    symbol: true,
    weight: true,
    last: true,
    qty: true,
    bep: false,
    total_value: true,
    retour: true,
  })
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchStockInfo = async (symbols: string[]) => {
    const uniqueSymbols = [...new Set(symbols)]
    const infoPromises = uniqueSymbols.map(async (symbol) => {
      try {
        const info = await getStockInfo(symbol)
        return [symbol, info]
      } catch (e) {
        console.error(`Error fetching info for ${symbol}:`, e)
        return [symbol, { sector: 'Non disponible', industry: 'Non disponible' }]
      }
    })
    
    const results = await Promise.all(infoPromises)
    const newStockInfo = Object.fromEntries(results)
    setStockInfo(newStockInfo)
  }

  const fetchData = async (id: string) => {
    try {
      const res = await get(id)
      setOwn(res.own)
      setPortfolio(res.data)
      const allocationData = res.data.allocation.map(item => ({
        ...item,
        sector: stockInfo[item.symbol]?.sector || 'Chargement...',
        industry: stockInfo[item.symbol]?.industry || 'Chargement...'
      }))
      setData(allocationData)
      
      // Fetch stock info if not already available
      const symbols = res.data.allocation.map(item => item.symbol)
      const missingSymbols = symbols.filter(symbol => !stockInfo[symbol])
      if (missingSymbols.length > 0) {
        fetchStockInfo(missingSymbols)
      }
      
      setLoading(false)
    } catch (e) {
      console.error('error api:', e)
      setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0, totalValue: 0 })
      setLoading(false)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du portfolio",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchData(id)
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        refreshData()
      }
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [id])

  const refreshData = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await fetchData(id)
    } finally {
      setIsRefreshing(false)
    }
  }

  const debouncedRefresh = useMemo(
    () =>
      debounce(() => {
        refreshData()
      }, 500),
    [refreshData]
  )

  useEffect(() => {
    window.addEventListener('focus', debouncedRefresh)
    return () => {
      window.removeEventListener('focus', debouncedRefresh)
      debouncedRefresh.cancel()
    }
  }, [debouncedRefresh])

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setColumnVisibility({
        symbol: true,
        weight: true,
        last: true,
        qty: true,
        bep: !isMobile,
        total_value: true,
        retour: true,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (Object.keys(stockInfo).length > 0) {
      const updatedData = data.map(item => ({
        ...item,
        sector: stockInfo[item.symbol]?.sector || 'Non disponible',
        industry: stockInfo[item.symbol]?.industry || 'Non disponible'
      }))
      setData(updatedData)
    }
  }, [stockInfo])

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
    try {
      transactionData.id = uuidv4()
      const res = await AddTransaction(id, transactionData)
      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
      toast({
        title: "Transaction ajoutée",
        description: "Votre transaction a été enregistrée avec succès",
      })
      return res
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la transaction",
        variant: "destructive",
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
        title: "Mouvement ajouté",
        description: "Le mouvement a été enregistré avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du mouvement",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="flex w-full flex-wrap-reverse gap-0.5">
      <Card className="w-full flex-grow lg:w-8/12">
        <CardHeader className="px-2 pb-1 pt-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1">
              <span className="text-base">Investissements</span>
              {data.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Aucun investissement
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshData}
              disabled={isRefreshing}
              className="h-6 w-6"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {own && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <div className="flex flex-1 items-center gap-1 md:flex-none">
                <AccountsMouvements
                  data-umami-event="portfolio-accounts-mouvements-button"
                  Trigger={() => (
                    <Button variant="outline" size="sm" className="flex-1 gap-1 min-w-[110px] h-7 text-xs bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <span>Dépôt / retrait</span>
                    </Button>
                  )}
                  submitHandler={addMouvement}
                />

                <TransactionDialogue
                  data-umami-event="portfolio-add-transaction-button"
                  Trigger={() => (
                    <Button variant="outline" size="sm" className="flex-1 gap-1 min-w-[110px] h-7 text-xs bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Acheter / Vendre</span>
                    </Button>
                  )}
                  totalPortfolioValue={portfolio.totalValue}
                  submitHandler={addTransaction}
                />
              </div>

              <div className="flex items-center gap-1">
                <Link 
                  data-umami-event="portfolio-import-button" 
                  href={`${id}/import`} 
                  className="shrink-0"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1 h-7 text-xs bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                  >
                    <FileScan className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Importer</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <WalletMinimal className="h-8 w-8 text-muted-foreground/50" />
              <h3 className="mt-2 text-base font-semibold">Aucun investissement</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Commencez par ajouter votre premier investissement
              </p>
              <TransactionDialogue
                Trigger={() => (
                  <Button className="mt-2 h-7 text-xs" size="sm">
                    <PlusIcon className="mr-1 h-3.5 w-3.5" />
                    Ajouter un investissement
                  </Button>
                )}
                totalPortfolioValue={portfolio.totalValue}
                submitHandler={addTransaction}
              />
            </div>
          ) : (
            <>
              <div className="w-full">
                <SimpleDataTable table={table} colSpan={columns.length} />
              </div>
              <div className="mt-1 grid grid-cols-4 px-2 py-1">
                <div className="text-sm">Espèces</div>
                <div className="pl-8 text-sm font-medium">
                  {round10(portfolio.cashValue, -2).toLocaleString()} €
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <div className="w-fill flex flex-grow flex-col gap-0.5">
        <StatsCard pftData={portfolio} />
        {data.length > 0 && (
          <AllocationPie data={data} totalValue={portfolio.totalValue} />
        )}
      </div>
    </div>
  )
}
