'use client'

import React, { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import watchListService from '@/services/watchListService'
import { security } from './data/security'
import {
  ColumnFiltersState,
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
import { ArrowLeft, LineChart, Settings} from 'lucide-react'
import Loader from '@/components/molecules/loader/loader'
import { useLocalStorage } from '@/hooks/useLocalStorage' // Re-import useLocalStorage
import { useToast } from '@/hooks/use-toast'

import { TableView } from './components/TableView'
import { TickerChart } from './components/TickerChart'
import { WatchlistSelector } from './components/WatchlistSelector'
import { AnalysisView } from '@/components/organismes/market/AnalysisView'
import { LayoutDashboard, Table as TableIcon } from 'lucide-react'
import { RightSidebar } from '@/components/organismes/layout/RightSidebar'

export interface watchList {
  _id: string
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

export default function Watchlist() {
  const id = usePathname().split('/')[3]
  const { toast } = useToast()

  const { getItem, setItem } = useLocalStorage()
  const globalTagsKey = 'global_watchlist_tags'
  const localSecurityTagsKey = `watchlist_security_tags_${id}` // Key for tags specific to this watchlist

  const [data, setData] = React.useState<watchList>({
    _id: '',
    name: '',
    benchMark: null,
    securities: [],
  })
  const [view, setView] = React.useState<'table' | 'analysis'>('table')
  const [allWatchlists, setAllWatchlists] = React.useState<watchList[]>([])
  const [owned, setOwned] = React.useState(false)
  const [loading, setloading] = React.useState(true)
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)
  const [showChart, setShowChart] = React.useState(false)

  const [allAvailableTags, setAllAvailableTags] = React.useState<string[]>([])

  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setShowChart(false)
    }
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    actions: true,
    symbol: true,
    regularMarketPrice: true,
    variation: true,
    sector: true,
    trailingPE: true,
    dividendYield: true,
    growth: true,
    tags: true,
    roa: false,
    roe: false,
    linearity10y: false,
    ret_lin: false,
    forwardPE: false,
    industry: false,
    relativePerformances: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')

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

  const useDynamicTableData = (securities: security[]) => {
    return useMemo(() => {
      return securities.map((security) => ({
        ...security,
        variation: security.variations?.[selectedPeriod] ?? security.regularMarketChangePercent,
      }))
    }, [data, selectedPeriod])
  }

  const useDynamicColumns = () =>
    useMemo(() => {
      return columns(id, owned, data.benchMark, deleteRow, selectedPeriod, allWatchlists)
    }, [id, owned, data.benchMark, deleteRow, selectedPeriod, allWatchlists])

  const table = useReactTable<security>({
    data: useDynamicTableData(data!.securities),
    columns: useDynamicColumns(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = filterValue.toLowerCase()
      return (
        row.original.symbol.toLowerCase().includes(value) ||
        row.original.longname.toLowerCase().includes(value) ||
        row.original.shortname.toLowerCase().includes(value)
      )
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setloading(true)
        const [listResponse, allResponse] = await Promise.all([
          watchListService.get(id),
          watchListService.getAll(),
        ])

        // Load global tags from local storage
        const storedGlobalTagsString = getItem(globalTagsKey)
        const storedGlobalTags: string[] = storedGlobalTagsString
          ? JSON.parse(storedGlobalTagsString)
          : []
        setAllAvailableTags(storedGlobalTags)

        // Load security-specific tags from local storage
        const storedLocalSecurityTagsString = getItem(localSecurityTagsKey)
        const storedLocalSecurityTags: LocalSecurityTags = storedLocalSecurityTagsString
          ? JSON.parse(storedLocalSecurityTagsString)
          : {}

        const securitiesWithLocalTags = listResponse.watchlist.securities.map((sec) => ({
          ...sec,
          tags: storedLocalSecurityTags[sec.symbol] || [],
        }))

        setData({
          ...listResponse.watchlist,
          securities: securitiesWithLocalTags,
        })

        if (listResponse.watchlist?.securities?.length > 0) {
          setSelectedTicker(listResponse.watchlist.securities[0].symbol)
        }
        setOwned(listResponse.owned)
        setAllWatchlists(allResponse)
      } catch (err) {
        console.error(err)
        toast({
          variant: 'destructive',
          title: 'Erreur de chargement',
          description: 'Impossible de récupérer les données de la watchlist.',
        })
      } finally {
        setloading(false)
      }
    }
    fetchData()
  }, [id])

  return loading ? (
    <Loader />
  ) : (
    <div className="flex h-[calc(100vh-20px)] flex-col space-y-2 p-2">
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setView(view === 'table' ? 'analysis' : 'table')}
            title={view === 'table' ? 'Vue Analyse' : 'Vue Tableau'}
          >
            {view === 'table' ? (
              <LayoutDashboard className="h-4 w-4" />
            ) : (
              <TableIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 shrink-0 rounded-full ${showChart ? 'bg-gray-100' : ''}`}
            onClick={() => setShowChart(!showChart)}
          >
            <LineChart className="h-4 w-4" />
            <span className="sr-only">Afficher/Masquer le graphique</span>
          </Button>
          {owned && (
            <Link href={`/app/watchlist/${id}/settings`}>
              <Settings className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span className="sr-only">Paramètres</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="bg-dark flex-1 overflow-hidden rounded-lg border">
          {!loading && data!.securities != null && (
            <div className="flex h-full flex-col">
              {view === 'table' ? (
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
                />
              ) : (
                <AnalysisView
                  securities={data.securities}
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
              )}
            </div>
          )}
        </div>
        <RightSidebar
          isOpen={showChart}
          onClose={() => setShowChart(false)}
          title={selectedTicker ? `ANALYSE : ${selectedTicker}` : 'ANALYSE'}
          className="md:relative md:shadow-none"
        >
          {selectedTicker ? (
            <TickerChart
              symbol={selectedTicker}
              tags={data?.securities.find((sec) => sec.symbol === selectedTicker)?.tags || []}
              allAvailableTags={allAvailableTags}
              onTagsChange={(newTags) => onTagsChangeForSymbol(selectedTicker, newTags)}
              onAddGlobalTag={onAddGlobalTag}
              onDeleteGlobalTag={onDeleteGlobalTag}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a security to view chart
            </div>
          )}
        </RightSidebar>
      </div>
    </div>
  )
}
