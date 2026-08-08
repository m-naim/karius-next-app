'use client'

import { usePathname, useRouter } from 'next/navigation'
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
  SlidersHorizontal,
  Check,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TransactionDialogue from './TransactionDialogue'
import Link from 'next/link'
import {
  AddTransaction,
  get,
  addMouvementService,
  initPortfolioSSE,
} from '@/services/portfolioService'
import { v4 as uuidv4 } from 'uuid'
import StatsCard from './StatsCard'
import AccountsMouvements from './AccountsMouvements'
import Loader from '@/components/molecules/loader/loader'
import { round10 } from '@/lib/decimalAjustement'
import AllocationPie from './AllocationPie'
import PortfolioTable from '@/components/molecules/table/PortfolioTable'
import PortfolioAssetDrawer from './PortfolioAssetDrawer'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export default function PortfolioView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = React.useState<PortfolioSecurity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedSecurity, setSelectedSecurity] = useState<PortfolioSecurity | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [portfolio, setPortfolio] = useState<any>({
    _id: '',
    allocation: [],
    transactions: [],
    cashValue: 0,
    totalValue: 0,
    baseCurrency: 'EUR',
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
    variationPercent: true,
    variation: true,
    revGrowth: false,
    roic: false,
    pe5y: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')
  const [useNativeCurrency, setUseNativeCurrency] = React.useState(false)
  const [showMetrics, setShowMetrics] = React.useState(false)

  useEffect(() => {
    if (showMetrics) {
      setColumnVisibility({
        symbol: true,
        weight: false,
        last: false,
        bep: false,
        variationPercent: false,
        variation: false,
        revGrowth: true,
        roic: true,
        pe5y: true,
      })
    } else {
      setColumnVisibility({
        symbol: true,
        weight: true,
        last: true,
        bep: true,
        variationPercent: true,
        variation: true,
        revGrowth: false,
        roic: false,
        pe5y: false,
      })
    }
  }, [showMetrics])

  const useDynamicColumns = () =>
    useMemo(() => {
      return columns(selectedPeriod, portfolio.baseCurrency, useNativeCurrency, own)
    }, [selectedPeriod, portfolio.baseCurrency, useNativeCurrency, own])

  const fetchData = async (id: string) => {
    try {
      const res = await get(id)
      if (!res || !res.data) {
        toast({
          title: 'Portefeuille introuvable',
          description: 'Redirection vers la page d\'exploration...',
          variant: 'destructive',
        })
        router.replace('/app/portfolios/explore')
        return
      }
      setOwn(res.own)
      setPortfolio(res.data)
      setData(res.data.allocation)
      setLoading(false)
    } catch (e) {
      console.error('error api:', e)
      setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0, totalValue: 0 })
      setLoading(false)
      toast({
        title: 'Portefeuille introuvable',
        description: 'Redirection vers la page d\'exploration...',
        variant: 'destructive',
      })
      router.replace('/app/portfolios/explore')
    }
  }

  useEffect(() => {
    fetchData(id)
    const es = initPortfolioSSE(id)
    es.addEventListener('portfolio', (event) => {
      const eventData = JSON.parse(event.data)
      setPortfolio(eventData)
      setData(eventData.allocation)
    })
    return () => {
      es.close()
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
      transactionData.entryDate = new Date().toISOString()
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
    <div className="flex w-full min-h-screen flex-1 flex-col overflow-y-auto bg-background">
      {/* LEFT PANE: Stats, Table & Allocation */}
      <div className="flex flex-1 min-w-0 flex-col gap-3 sm:gap-6 p-2 sm:p-4 pb-4 sm:pb-8">
        {/* HERO SECTION: Stats at the top */}
        <div className="w-full">
          <StatsCard pftData={portfolio} own={own} />
        </div>

        <div className="flex w-full flex-col lg:flex-row gap-3 sm:gap-6">
          {/* LEFT COLUMN: Table */}
          <div className="w-full flex-grow lg:w-8/12">
            <Card className="overflow-hidden border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border bg-muted/30 p-3 sm:p-4 space-y-3">
                {/* ROW 1: Title, Cash & Primary Actions */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">Investissements</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{data.length}</span>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs ml-2">
                      <span className="text-muted-foreground">Cash:</span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {round10(portfolio.cashValue, -2).toLocaleString()} {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: portfolio.baseCurrency || 'EUR' }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'}
                      </span>
                    </div>
                  </div>

                  {own && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AccountsMouvements
                        submitHandler={addMouvement}
                        Trigger={(props) => (
                          <Button {...props} variant="outline" size="sm" className="h-8 px-2 sm:px-3 gap-1.5 text-xs">
                            <WalletMinimal className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Espèces</span>
                          </Button>
                        )}
                      />
                      <TransactionDialogue
                        totalPortfolioValue={portfolio.totalValue}
                        submitHandler={addTransaction}
                        Trigger={(props) => (
                          <Button {...props} size="sm" className="h-8 px-3 sm:px-4 gap-1.5 text-xs font-bold shadow-sm">
                            <PlusIcon className="h-3.5 w-3.5" />
                            <span>Transaction</span>
                          </Button>
                        )}
                      />
                      <Link href={`${id}/import`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 border border-border">
                          <FileScan className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* ROW 2: Search Input, Period Selector & Display Options */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={globalFilter ?? ''}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="h-8 bg-background pl-8 text-xs border-border/70"
                    />
                  </div>

                  <div 
                    role="group" 
                    aria-label="Période de performance" 
                    className="flex items-center gap-0.5 rounded-full bg-background/80 border border-border/60 p-0.5 overflow-x-auto max-w-full no-scrollbar shrink-0"
                  >
                    {['1d', '1w', '1m', '3m', '6m', '1y', '5y'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        aria-pressed={selectedPeriod === p}
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0',
                          selectedPeriod === p
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Distilled View Options Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1 rounded-full border-border/60 bg-background text-[11px] px-2.5 shrink-0">
                        <SlidersHorizontal className="h-3 w-3" />
                        <span className="hidden sm:inline">Affichage</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs">Options d'affichage</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setUseNativeCurrency(!useNativeCurrency)}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span>Devise locale ({useNativeCurrency ? 'Oui' : 'Non'})</span>
                        {useNativeCurrency && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowMetrics(!showMetrics)}
                        className="flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span>Métriques 5 ans (ROIC, PE)</span>
                        {showMetrics && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <WalletMinimal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun investissement</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Commencez par ajouter votre premier actif ou importez un fichier.
                    </p>
                    <div className="mt-6 flex gap-3">
                      <TransactionDialogue
                        Trigger={(props) => (
                          <Button {...props} size="sm" className="gap-2">
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
                    <PortfolioTable
                      table={table}
                      colSpan={columns.length}
                      selectedSymbol={selectedSecurity?.symbol}
                      onRowClick={(sec) => {
                        setSelectedSecurity(sec)
                        setIsDrawerOpen(true)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Allocation */}
          <div className="w-full flex flex-grow flex-col gap-6 lg:max-w-xs">
            {data.length > 0 && (
              <Card className="overflow-hidden border-border bg-card shadow-sm">
                <CardHeader className="px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Répartition</h3>
                </CardHeader>
                <CardContent className="p-4">
                  <AllocationPie data={data} totalValue={portfolio.totalValue} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* SIDE DRAWER RICHESSE DES ACHATS & TRANSACTIONS */}
      <PortfolioAssetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        security={selectedSecurity}
        portfolio={portfolio}
        own={own}
      />
    </div>
  )
}
