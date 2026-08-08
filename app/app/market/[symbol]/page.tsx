'use client'

import React, { useEffect, useMemo } from 'react'
import marketService from '@/services/marketService'
import { security } from '../../watchlist/[id]/data/security'
import {
  ColumnFiltersState,
  ColumnOrderState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LineChart } from 'lucide-react'
import Loader from '@/components/molecules/loader/loader'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { TableView } from '../../watchlist/[id]/components/TableView'
import { TickerChart } from '../../watchlist/[id]/components/TickerChart'
import { AnalysisView } from '@/components/organismes/market/AnalysisView'
import { columns } from './columns'
import { LayoutDashboard, Table as TableIcon } from 'lucide-react'
import { SplitScreenLayout } from '@/components/organismes/layout/SplitScreenLayout'
import { filterSecuritiesByScreener } from '@/lib/screeners'

import watchListService from '@/services/watchListService'

import { ViewToggleSwitch } from '@/components/atoms/ViewToggleSwitch'
import {
  getSavedColumnVisibility,
  getSavedColumnOrder,
  saveColumnVisibility,
  saveColumnOrder,
} from '@/lib/column-persistence'

const DEFAULT_MARKET_VISIBILITY: VisibilityState = {
  symbol: true,
  regularMarketPrice: true,
  variation: true,
  trailingPE: true,
  dividendYield: true,
  linearity10y: true,
  ret_lin: true,
  marketCap: true,
  weight: true,
  forwardPE: false,
  roa: false,
  roe: false,
  growth: false,
  revGrowth: false,
  roic: false,
  pe5y: false,
}

interface IndexData {
  symbol: string
  name: string
  holdings: security[]
}

export default function MarketDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: rawSymbol } = React.use(params)
  const symbol = decodeURIComponent(rawSymbol)
  const { toast } = useToast()

  const [indexInfo, setIndexInfo] = React.useState<IndexData>({
    symbol: '',
    name: '',
    holdings: [],
  })

  const [securities, setSecurities] = React.useState<security[]>([])
  const [watchlists, setWatchlists] = React.useState<any[]>([])
  const [activeScreener, setActiveScreener] = React.useState<string | null>(null)

  const filteredSecurities = useMemo(() => {
    return filterSecuritiesByScreener(securities, activeScreener)
  }, [securities, activeScreener])

  const [view, setView] = React.useState<'table' | 'analysis'>('table')
  const [loading, setLoading] = React.useState(true)
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)
  const [showChart, setShowChart] = React.useState(false)

  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setShowChart(false)
    }
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    getSavedColumnOrder([])
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    getSavedColumnVisibility(DEFAULT_MARKET_VISIBILITY)
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')
  const [showMetrics, setShowMetrics] = React.useState(false)

  React.useEffect(() => {
    if (showMetrics) {
      setColumnVisibility({
        symbol: true,
        regularMarketPrice: false,
        variation: false,
        trailingPE: false,
        dividendYield: false,
        linearity10y: false,
        ret_lin: false,
        marketCap: false,
        weight: false,
        forwardPE: false,
        roa: false,
        roe: false,
        growth: false,
        revGrowth: true,
        roic: true,
        pe5y: true,
      })
    } else {
      setColumnVisibility({
        symbol: true,
        regularMarketPrice: true,
        variation: true,
        trailingPE: true,
        dividendYield: true,
        linearity10y: true,
        ret_lin: true,
        marketCap: true,
        weight: true,
        forwardPE: false,
        roa: false,
        roe: false,
        growth: false,
        revGrowth: false,
        roic: false,
        pe5y: false,
      })
    }
  }, [showMetrics])

  const tableData = useMemo(() => {
    return filteredSecurities.map((security) => ({
      ...security,
      variation: security.variations?.[selectedPeriod] ?? security.regularMarketChangePercent,
    }))
  }, [filteredSecurities, selectedPeriod])

  const tableColumns = useMemo(() => {
    return columns(selectedPeriod, watchlists)
  }, [selectedPeriod, watchlists])

  const table = useReactTable<security>({
    data: tableData,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = (filterValue || '').toLowerCase()
      const symbol = (row.original.symbol || '').toLowerCase()
      const longname = (row.original.longname || '').toLowerCase()
      const shortname = (row.original.shortname || '').toLowerCase()
      return symbol.includes(value) || longname.includes(value) || shortname.includes(value)
    },
    state: {
      sorting,
      columnFilters,
      columnOrder,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [infos, userWatchlists] = await Promise.all([
          marketService.get(symbol),
          watchListService.getAll().catch(() => []),
        ])
        setIndexInfo(infos)
        setSecurities(infos.holdings)
        setWatchlists(userWatchlists || [])
      } catch (error) {
        console.error(error)
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible de charger les données de l'indice.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [symbol, toast])

  return loading ? (
    <Loader />
  ) : (
    <SplitScreenLayout
      header={
        <div className="bg-dark flex shrink-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 md:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/app/market" className="inline-flex shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 truncate">
              <h1 className="truncate text-sm font-bold text-foreground md:text-lg">{indexInfo.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ViewToggleSwitch view={view} onViewChange={setView} />

            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8 shrink-0 rounded-full', showChart ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}
              onClick={() => setShowChart(!showChart)}
            >
              <LineChart className="h-4 w-4" />
              <span className="sr-only">Afficher/Masquer le graphique</span>
            </Button>
          </div>
        </div>
      }
      showDrawer={showChart}
      onCloseDrawer={() => setShowChart(false)}
      drawerTitle={selectedTicker ? `ANALYSE : ${selectedTicker}` : 'ANALYSE'}
      drawerContent={
        selectedTicker ? (
          <TickerChart symbol={selectedTicker} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a security to view chart
          </div>
        )
      }
    >
      {!loading && (
        view === 'table' ? (
          <TableView
            table={table}
            id={symbol}
            owned={false}
            setData={() => {}}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            columns={columns(selectedPeriod, watchlists)}
            onRowClick={(row) => {
              setSelectedTicker(row.symbol)
              if (!showChart) setShowChart(true)
            }}
            selectedTicker={selectedTicker}
            showMetrics={showMetrics}
            setShowMetrics={setShowMetrics}
            activeScreener={activeScreener}
            setActiveScreener={setActiveScreener}
          />
        ) : (
          <AnalysisView
            securities={securities}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        )
      )}
    </SplitScreenLayout>
  )
}
