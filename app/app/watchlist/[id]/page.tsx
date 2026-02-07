'use client'

import React, { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import watchListService, { removeList } from '@/services/watchListService'
import { security } from './data/security'
import { TableContextHeader } from './components/table-header'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'
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
import { ArrowLeft, EllipsisVertical, LineChart, StarIcon, Trash2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Loader from '@/components/molecules/loader/loader'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { TableView } from './components/TableView'
import { TickerChart } from './components/TickerChart'
import { WatchlistSelector } from './components/WatchlistSelector'

interface watchList {
  _id: string
  name: string
  securities: security[]
  updatedAt?: string
}

export default function Watchlist() {
  const id = usePathname().split('/')[3]
  const router = useRouter()

  const [data, setData] = React.useState<watchList>({
    _id: '',
    name: '',
    securities: [],
  })
  const [allWatchlists, setAllWatchlists] = React.useState<watchList[]>([])
  const [owned, setOwned] = React.useState(false)
  const [loading, setloading] = React.useState(true)
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)
  const [showChart, setShowChart] = React.useState(false)

  React.useEffect(() => {
    if (window.innerWidth >= 768) {
      setShowChart(false)
    }
  }, [])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedPeriod, setSelectedPeriod] = React.useState('1d')

  const deleteRow = (symbol: string) => {
    setData((prevData) => ({
      ...prevData,
      securities: prevData.securities.filter((row) => row.symbol !== symbol),
    }))
  }

  const useDynamicTableData = (securities: security[]) => {
    return useMemo(() => {
      // Recalculate data if needed based on selectedPeriod
      return securities.map((security) => ({
        ...security,
        variation: security.variations?.[selectedPeriod] ?? security.regularMarketChangePercent,
      }))
    }, [data, selectedPeriod])
  }

  const useDynamicColumns = () =>
    useMemo(() => {
      return columns(id, owned, deleteRow, selectedPeriod)
    }, [id, owned, deleteRow, selectedPeriod])

  const table = useReactTable<security>({
    data: useDynamicTableData(data!.securities),
    columns: useDynamicColumns(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setloading(true)
      const [listResponse, allResponse] = await Promise.all([
        watchListService.get(id),
        watchListService.getAll(),
      ])
      setData(listResponse.watchlist)
      if (listResponse.watchlist?.securities?.length > 0) {
        setSelectedTicker(listResponse.watchlist.securities[0].symbol)
      }
      setOwned(listResponse.owned)
      setAllWatchlists(allResponse)
      setloading(false)
    }
    fetchData()
  }, [id])

  const handleDeleteClick = async () => {
    try {
      await removeList(id)
      router.push('/app/watchlist')
    } catch (e) {
      console.error('error', e)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <div className="flex h-[calc(100vh-100px)] flex-col space-y-4 p-4 md:p-6">
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
            className={`h-8 w-8 shrink-0 rounded-full ${showChart ? 'bg-gray-100' : ''}`}
            onClick={() => setShowChart(!showChart)}
          >
            <LineChart className="h-4 w-4" />
            <span className="sr-only">Afficher/Masquer le graphique</span>
          </Button>
          {owned && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-gray-100"
                >
                  <EllipsisVertical className="h-4 w-4" />
                  <span className="sr-only">Menu d'actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="bg-dark flex-1 overflow-hidden rounded-lg border">
          {!loading && data!.securities != null && (
            <div className="flex h-full flex-col">
              <TableView
                table={table}
                id={id}
                owned={owned}
                setData={setData}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                columns={columns(id, owned, deleteRow, selectedPeriod)}
                onRowClick={(row) => {
                  setSelectedTicker(row.symbol)
                  if (!showChart) setShowChart(true)
                }}
                selectedTicker={selectedTicker}
              />
            </div>
          )}
        </div>
        {showChart && (
          <div className="md:bg-dark fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-background p-4 md:relative md:h-auto md:w-[400px] md:rounded-lg md:border">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 z-10 md:hidden"
              onClick={() => setShowChart(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 hidden h-6 w-6 text-gray-500 hover:bg-gray-100 md:flex"
              onClick={() => setShowChart(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
            {selectedTicker ? (
              <TickerChart symbol={selectedTicker} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a security to view chart
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
