'use client'

import React, { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
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
import { ArrowLeft, LineChart, Settings, Download } from 'lucide-react'
import Loader from '@/components/molecules/loader/loader'
import { useLocalStorage } from '@/hooks/useLocalStorage' // Re-import useLocalStorage
import { useToast } from '@/hooks/use-toast'

import {
  getSavedColumnVisibility,
  getSavedColumnOrder,
} from '@/lib/column-persistence'
import { filterSecuritiesByScreener } from '@/lib/screeners'
import { ViewToggleSwitch } from '@/components/atoms/ViewToggleSwitch'

const DEFAULT_WATCHLIST_VISIBILITY: VisibilityState = {
  actions: true,
  symbol: true,
  regularMarketPrice: true,
  variation: true,
  sector: true,
  trailingPE: true,
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
}
import { TableView } from './components/TableView'
import { TickerChart } from './components/TickerChart'
import { WatchlistSelector } from './components/WatchlistSelector'
import { AnalysisView } from '@/components/organismes/market/AnalysisView'
import { LayoutDashboard, Table as TableIcon } from 'lucide-react'
import { RightSidebar } from '@/components/organismes/layout/RightSidebar'
import { SplitScreenLayout } from '@/components/organismes/layout/SplitScreenLayout'
import { cn } from '@/lib/utils'

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
  const [allWatchlists, setAllWatchlists] = React.useState<watchList[]>(() => cachedAllWatchlists || [])
  const [owned, setOwned] = React.useState(() => cachedWatchlist?.owned ?? false)
  const [loading, setLoading] = React.useState(() => !cachedWatchlist)
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(() => {
    return cachedWatchlist?.watchlist?.securities?.[0]?.symbol || null
  })
  const [showChart, setShowChart] = React.useState(false)
  const [activeScreener, setActiveScreener] = React.useState<string | null>(null)

  const [allAvailableTags, setAllAvailableTags] = React.useState<string[]>([])

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
      'Yield %',
      'Revenue Growth %',
      'ROE %',
      'ROA %'
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
        (s.dividendYield ? s.dividendYield * 100 : 0).toFixed(2),
        (s.score?.growth ? s.score.growth * 100 : 0).toFixed(2),
        (s.lastYearFundamental?.roe ? s.lastYearFundamental.roe * 100 : 0).toFixed(2),
        (s.lastYearFundamental?.roa ? s.lastYearFundamental.roa * 100 : 0).toFixed(2)
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

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(() =>
    getSavedColumnOrder([])
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    getSavedColumnVisibility(DEFAULT_WATCHLIST_VISIBILITY)
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')
  const [showMetrics, setShowMetrics] = React.useState(false)

  React.useEffect(() => {
    if (showMetrics) {
      setColumnVisibility({
        actions: true,
        symbol: true,
        regularMarketPrice: false,
        variation: false,
        sector: false,
        trailingPE: false,
        dividendYield: false,
        growth: false,
        tags: true,
        hasFundamentals: false,
        roa: false,
        roe: false,
        linearity10y: false,
        ret_lin: false,
        forwardPE: false,
        industry: false,
        relativePerformances: false,
        revGrowth: true,
        roic: true,
        pe5y: true,
      })
    } else {
      setColumnVisibility({
        actions: true,
        symbol: true,
        regularMarketPrice: true,
        variation: true,
        sector: true,
        trailingPE: true,
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
      })
    }
  }, [showMetrics])

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
    let isMounted = true
    const fetchData = async () => {
      try {
        if (!cachedWatchlist) {
          setLoading(true)
        }
        const [listResponse, allResponse] = await Promise.all([
          watchListService.get(id),
          watchListService.getAll(),
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

        const securitiesWithLocalTags = (listResponse.watchlist?.securities || []).map((sec: any) => ({
          ...sec,
          tags: storedLocalSecurityTags[sec.symbol] || [],
        }))

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
            description: 'Impossible de récupérer vos actions suivies. Vérifiez votre connexion et réessayez.',
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
        <div className="bg-dark flex shrink-0 items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/app/watchlist" className="inline-flex shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 truncate">
              <WatchlistSelector watchlists={allWatchlists} currentId={id} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ViewToggleSwitch view={view} onViewChange={setView} />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={downloadCSV}
              aria-label="Télécharger en CSV"
              title="Télécharger en CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 shrink-0 rounded-full',
                showChart ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setShowChart(!showChart)}
            >
              <LineChart className="h-4 w-4" />
              <span className="sr-only">Afficher/Masquer le graphique</span>
            </Button>

            {owned && (
              <Link href={`/app/watchlist/${id}/settings`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label="Paramètres de la watchlist"
                  title="Paramètres"
                  asChild={false}
                >
                  <Settings className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      }
      showDrawer={showChart}
      onCloseDrawer={() => setShowChart(false)}
      drawerTitle={selectedTicker ? `ANALYSE : ${selectedTicker}` : 'ANALYSE'}
      drawerContent={
        selectedTicker ? (
          <TickerChart
            symbol={selectedTicker}
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
      {!loading && data!.securities != null && (
        view === 'table' ? (
          <TableView
            table={table}
            id={id}
            owned={owned}
            setData={setData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            columns={columns(
              id,
              owned,
              data.benchMark,
              deleteRow,
              selectedPeriod,
              allWatchlists
            )}
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
        )
      )}
    </SplitScreenLayout>
  )
}
