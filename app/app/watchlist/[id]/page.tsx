'use client'

import React, { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import watchListService from '@/services/watchListService'
import { security } from './data/security'
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
import { columns } from './components/columns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LineChart, Settings, Download } from 'lucide-react'
import Loader from '@/components/molecules/loader/loader'
import { useLocalStorage } from '@/hooks/useLocalStorage' // Re-import useLocalStorage
import { useToast } from '@/hooks/use-toast'

import { getSavedColumnVisibility, getSavedColumnOrder } from '@/lib/column-persistence'
import {
  getSavedTableFilters,
  saveTableFilters,
  WATCHLIST_FILTERS_STORAGE_KEY,
} from '@/lib/filter-persistence'
import { filterSecuritiesByScreener } from '@/lib/screeners'
import { ListPageHeader } from '@/components/molecules/table/ListPageHeader'

const DEFAULT_WATCHLIST_VISIBILITY: VisibilityState = {
  actions: true,
  symbol: true,
  regularMarketPrice: true,
  variation: true,
  earningsDate: true,
  sector: true,
  trailingPE: true,
  priceToSales: true,
  dividendYield: true,
  growth: true,
  tags: true,
  hasFundamentals: false,
  roa: false,
  roe: false,
  linearity10y: false,
  ret_lin: false,
  forwardPE: false,
  industry: false,
  relativePerformances: false,
  revGrowth: false,
  roic: false,
  pe5y: false,
  psGrowth5y: false,
  peg5y: false,
}
import { TableView } from './components/TableView'
import { WatchlistSelector } from './components/WatchlistSelector'
import { SplitScreenLayout } from '@/components/organismes/layout/SplitScreenLayout'
import { AnalysisDrawerTitle } from '@/components/molecules/market/AnalysisDrawerTitle'
import { cn } from '@/lib/utils'
import { EntityNotificationButton } from '@/components/notifications/EntityNotificationButton'
import {
  EarningsCalendarEvent,
  getEarningsCalendar,
} from '@/services/earningsCalendarService'

const TickerChart = dynamic(
  () => import('./components/TickerChart').then((module) => module.TickerChart),
  { ssr: false }
)

const AnalysisView = dynamic(
  () => import('@/components/organismes/market/AnalysisView').then((module) => module.AnalysisView),
  { ssr: false }
)

export interface watchList {
  _id?: string
  id?: string
  name: string
  benchMark?: {
    symbol: string
    variations: Record<string, number>
  } | null
  securities: security[]
  updatedAt?: string
}

type LocalSecurityTags = {
  [symbol: string]: string[]
}

export default function WatchlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = React.use(params)
  const id = decodeURIComponent(rawId)
  const { toast } = useToast()

  const { getItem, setItem } = useLocalStorage()
  const globalTagsKey = 'global_watchlist_tags'
  const localSecurityTagsKey = `watchlist_security_tags_${id}` // Key for tags specific to this watchlist

  const cachedWatchlist = React.useMemo(() => watchListService.getCached(id), [id])
  const cachedAllWatchlists = React.useMemo(() => watchListService.getAllCached(), [])

  const [data, setData] = React.useState<watchList>(() => {
    if (cachedWatchlist?.watchlist) {
      return cachedWatchlist.watchlist
    }
    return {
      _id: '',
      name: '',
      benchMark: null,
      securities: [],
    }
  })
  const [view, setView] = React.useState<'table' | 'analysis'>('table')
  const [allWatchlists, setAllWatchlists] = React.useState<watchList[]>(
    () => cachedAllWatchlists || []
  )
  const [owned, setOwned] = React.useState(() => cachedWatchlist?.owned ?? false)
  const [loading, setLoading] = React.useState(() => !cachedWatchlist)
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(() => {
    return cachedWatchlist?.watchlist?.securities?.[0]?.symbol || null
  })
  const [showChart, setShowChart] = React.useState(false)
  const savedFilters = React.useMemo(() => getSavedTableFilters(WATCHLIST_FILTERS_STORAGE_KEY), [])
  const [activeScreener, setActiveScreener] = React.useState<string | null>(
    () => savedFilters.activeScreener ?? null
  )

  const [allAvailableTags, setAllAvailableTags] = React.useState<string[]>([])

  const selectedSecurity = useMemo(
    () => data.securities?.find((security) => security.symbol === selectedTicker),
    [data.securities, selectedTicker]
  )

  const downloadCSV = () => {
    if (!data.securities || data.securities.length === 0) return

    const headers = [
      'Symbol',
      'Name',
      'Price',
      'Change %',
      'Sector',
      'Industry',
      'P/E Trailing',
      'P/S',
      'Yield %',
      'Revenue Growth %',
      'ROE %',
      'ROA %',
    ]

    const csvRows = data.securities.map((s) => {
      return [
        `"${s.symbol}"`,
        `"${(s.longname || s.shortname || '').replace(/"/g, '""')}"`,
        s.regularMarketPrice || 0,
        s.regularMarketChangePercent || 0,
        `"${(s.sector || '').replace(/"/g, '""')}"`,
        `"${(s.industry || '').replace(/"/g, '""')}"`,
        s.trailingPE || '',
        (() => {
          const revenue = Number(s.lastYearFundamental?.totalRevenue)
          const marketCap = Number(s.marketCap)
          return revenue > 0 && marketCap > 0 ? (marketCap / revenue).toFixed(2) : ''
        })(),
        (s.dividendYield ? s.dividendYield * 100 : 0).toFixed(2),
        (s.score?.growth ? s.score.growth * 100 : 0).toFixed(2),
        (s.lastYearFundamental?.roe ? s.lastYearFundamental.roe * 100 : 0).toFixed(2),
        (s.lastYearFundamental?.roa ? s.lastYearFundamental.roa * 100 : 0).toFixed(2),
      ].join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `watchlist_${data.name || id}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'CSV Téléchargé',
      description: `Le fichier watchlist_${data.name || id}.csv a été généré avec succès.`,
    })
  }

  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setShowChart(false)
    }
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>(() => savedFilters.sorting ?? [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () => savedFilters.columnFilters ?? []
  )
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    getSavedColumnOrder([])
  )
  const [globalFilter, setGlobalFilter] = React.useState(() => savedFilters.globalFilter ?? '')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    getSavedColumnVisibility(DEFAULT_WATCHLIST_VISIBILITY)
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState(
    () => savedFilters.selectedPeriod ?? '1d'
  )
  const [showMetrics, setShowMetrics] = React.useState(false)

  // Automatically persist user filters across sessions
  React.useEffect(() => {
    saveTableFilters(WATCHLIST_FILTERS_STORAGE_KEY, {
      columnFilters,
      globalFilter,
      sorting,
      activeScreener,
      selectedPeriod,
    })
  }, [columnFilters, globalFilter, sorting, activeScreener, selectedPeriod])

  const deleteRow = (symbol: string) => {
    setData((prevData) => ({
      ...prevData,
      securities: prevData.securities.filter((row) => row.symbol !== symbol),
    }))
  }

  const onTagsChangeForSymbol = (symbol: string, newTags: string[]) => {
    // Update the specific security's tags in React state
    setData((prevData) => {
      const updatedSecurities = prevData.securities.map((sec) =>
        sec.symbol === symbol ? { ...sec, tags: newTags } : sec
      )
      return {
        ...prevData,
        securities: updatedSecurities,
      }
    })

    // Update local storage for this security's tags
    const currentLocalSecurityTagsString = getItem(localSecurityTagsKey)
    const currentLocalSecurityTags: LocalSecurityTags = currentLocalSecurityTagsString
      ? JSON.parse(currentLocalSecurityTagsString)
      : {}
    currentLocalSecurityTags[symbol] = newTags
    setItem(localSecurityTagsKey, JSON.stringify(currentLocalSecurityTags))

    // Ensure all new tags are added to the global available tags pool
    const newGlobalTags = Array.from(new Set([...allAvailableTags, ...newTags]))
    setAllAvailableTags(newGlobalTags)
    updateGlobalTagsInLocalStorage(newGlobalTags)
  }

  const onAddGlobalTag = (newTag: string) => {
    const updatedGlobalTags = Array.from(new Set([...allAvailableTags, newTag]))
    setAllAvailableTags(updatedGlobalTags)
    updateGlobalTagsInLocalStorage(updatedGlobalTags)
  }

  const onDeleteGlobalTag = (tagToDelete: string) => {
    const updatedGlobalTags = allAvailableTags.filter((tag) => tag !== tagToDelete)
    setAllAvailableTags(updatedGlobalTags)
    updateGlobalTagsInLocalStorage(updatedGlobalTags)

    // Also remove from all securities in this watchlist
    setData((prevData) => {
      const updatedSecurities = prevData.securities.map((sec) => ({
        ...sec,
        tags: sec.tags?.filter((t) => t !== tagToDelete) || [],
      }))

      // Update local storage for all securities in this watchlist
      const currentLocalSecurityTagsString = getItem(localSecurityTagsKey)
      if (currentLocalSecurityTagsString) {
        try {
          const currentLocalSecurityTags: LocalSecurityTags = JSON.parse(
            currentLocalSecurityTagsString
          )
          Object.keys(currentLocalSecurityTags).forEach((symbol) => {
            currentLocalSecurityTags[symbol] = currentLocalSecurityTags[symbol].filter(
              (t) => t !== tagToDelete
            )
          })
          setItem(localSecurityTagsKey, JSON.stringify(currentLocalSecurityTags))
        } catch (e) {
          console.error('Error parsing local security tags:', e)
        }
      }

      return {
        ...prevData,
        securities: updatedSecurities,
      }
    })
  }

  const updateGlobalTagsInLocalStorage = (tags: string[]) => {
    setItem(globalTagsKey, JSON.stringify(tags))
  }

  const tableData = useMemo(() => {
    const filtered = filterSecuritiesByScreener(data?.securities || [], activeScreener)
    return filtered.map((security) => ({
      ...security,
      variation: security.variations?.[selectedPeriod] ?? security.regularMarketChangePercent,
    }))
  }, [data, selectedPeriod, activeScreener])

  const tableColumns = useMemo(() => {
    return columns(id, owned, data?.benchMark, deleteRow, selectedPeriod, allWatchlists)
  }, [id, owned, data?.benchMark, deleteRow, selectedPeriod, allWatchlists])

  const validColumnOrder = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) return columnOrder
    const validIds = new Set(tableColumns.map((c: any) => c.id || c.accessorKey).filter(Boolean))
    return columnOrder.filter((colId) => validIds.has(colId))
  }, [columnOrder, tableColumns])

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
      columnOrder: validColumnOrder,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        if (!cachedWatchlist) {
          setLoading(true)
        }
        const today = new Date()
        const horizon = new Date(today)
        horizon.setDate(horizon.getDate() + 90)
        const [listResponse, allResponse, earningsEvents] = await Promise.all([
          watchListService.get(id),
          watchListService.getAll(),
          getEarningsCalendar(
            today.toISOString().slice(0, 10),
            horizon.toISOString().slice(0, 10),
            'watchlist'
          ).catch(() => []),
        ])

        // Load global tags from local storage
        const storedGlobalTagsString = getItem(globalTagsKey)
        const storedGlobalTags: string[] = storedGlobalTagsString
          ? JSON.parse(storedGlobalTagsString)
          : []
        if (isMounted) setAllAvailableTags(storedGlobalTags)

        // Load security-specific tags from local storage
        const storedLocalSecurityTagsString = getItem(localSecurityTagsKey)
        const storedLocalSecurityTags: LocalSecurityTags = storedLocalSecurityTagsString
          ? JSON.parse(storedLocalSecurityTagsString)
          : {}

        const earningsBySymbol = new Map<string, EarningsCalendarEvent>(
          earningsEvents.map(
            (event): [string, EarningsCalendarEvent] => [event.symbol.toUpperCase(), event]
          )
        )
        const securitiesWithLocalTags = (listResponse.watchlist?.securities || []).map(
          (sec: any) => {
            const earnings = earningsBySymbol.get(sec.symbol.toUpperCase())
            return {
              ...sec,
              tags: storedLocalSecurityTags[sec.symbol] || [],
              earningsDate: earnings?.date,
              earningsEstimated: earnings?.estimated,
              earningsSource: earnings?.source,
            }
          }
        )

        if (isMounted) {
          setData({
            ...listResponse.watchlist,
            securities: securitiesWithLocalTags,
          })

          if (listResponse.watchlist?.securities?.length > 0 && !selectedTicker) {
            setSelectedTicker(listResponse.watchlist.securities[0].symbol)
          }
          setOwned(listResponse.owned)
          setAllWatchlists(allResponse || [])
        }
      } catch (err) {
        console.error(err)
        if (isMounted && !cachedWatchlist) {
          toast({
            variant: 'destructive',
            title: 'Watchlist temporairement inaccessible',
            description:
              'Impossible de récupérer vos actions suivies. Vérifiez votre connexion et réessayez.',
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [id, cachedWatchlist])

  return loading ? (
    <Loader />
  ) : (
    <SplitScreenLayout
      isFixedLayout={true}
      header={
        <ListPageHeader
          backHref="/app/watchlist"
          title={<WatchlistSelector watchlists={allWatchlists} currentId={id} currentName={data.name} />}
          view={view}
          onViewChange={setView}
        >
          {owned && (
            <EntityNotificationButton
              entityId={id}
              entityType="watchlist"
              label="Recevoir un résumé"
              mobileLabel="Résumé"
              description={`Recevoir le résumé périodique de ${data.name || 'cette watchlist'}`}
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={downloadCSV}
            aria-label="Télécharger en CSV"
            title="Télécharger en CSV"
          >
            <Download className="h-4 w-4" /><span className="mobile-action-label sr-only">Exporter en CSV</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 shrink-0 rounded-full',
              showChart
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setShowChart(!showChart)}
          >
            <LineChart className="h-4 w-4" />
            <span className="mobile-action-label sr-only">Afficher / masquer le graphique</span>
          </Button>

          {owned && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Paramètres de la watchlist" title="Paramètres" asChild>
              <Link href={`/app/watchlist/${id}/settings`}>
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                <span className="mobile-action-label sr-only">Paramètres de la watchlist</span>
              </Link>
            </Button>
          )}
        </ListPageHeader>
      }
      showDrawer={showChart}
      onCloseDrawer={() => setShowChart(false)}
      drawerTitle={
        selectedTicker ? (
          <AnalysisDrawerTitle
            symbol={selectedTicker}
            price={selectedSecurity?.regularMarketPrice}
            quoteAsOf={selectedSecurity?.quoteAsOf}
            lastUpdated={selectedSecurity?.lastUpdated}
            currency={selectedSecurity?.currency}
          />
        ) : (
          'ANALYSE'
        )
      }
      drawerContent={
        selectedTicker ? (
          <TickerChart
            symbol={selectedTicker}
            compact
            tags={data?.securities.find((sec) => sec.symbol === selectedTicker)?.tags || []}
            allAvailableTags={allAvailableTags}
            onTagsChange={(newTags) => onTagsChangeForSymbol(selectedTicker, newTags)}
            onAddGlobalTag={onAddGlobalTag}
            onDeleteGlobalTag={onDeleteGlobalTag}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <LineChart className="h-8 w-8 opacity-30" />
            <p className="text-sm font-medium">Cliquez sur une valeur pour afficher son analyse</p>
          </div>
        )
      }
    >
      {!loading &&
        data!.securities != null &&
        (view === 'table' ? (
          <TableView
            table={table}
            id={id}
            owned={owned}
            setData={setData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            columns={columns(id, owned, data.benchMark, deleteRow, selectedPeriod, allWatchlists)}
            onRowClick={(row) => {
              setSelectedTicker(row.symbol)
              if (!showChart) setShowChart(true)
            }}
            selectedTicker={selectedTicker}
            allAvailableTags={allAvailableTags}
            allWatchlists={allWatchlists}
            showMetrics={showMetrics}
            setShowMetrics={setShowMetrics}
            activeScreener={activeScreener}
            setActiveScreener={setActiveScreener}
          />
        ) : (
          <AnalysisView
            securities={data.securities}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        ))}
    </SplitScreenLayout>
  )
}
