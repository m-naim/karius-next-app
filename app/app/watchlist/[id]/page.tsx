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
import { ArrowLeft, EllipsisVertical, StarIcon, Trash2 } from 'lucide-react'
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

interface watchList {
  name: string
  securities: security[]
  updatedAt?: string
}

export default function Watchlist() {
  const id = usePathname().split('/')[3]
  const router = useRouter()

  const [data, setData] = React.useState<watchList>({
    name: '',
    securities: [],
  })
  const [owned, setOwned] = React.useState(false)
  const [loading, setloading] = React.useState(true)

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
      const response = await watchListService.get(id)
      setData(response.watchlist)
      setOwned(response.owned)
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
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/app/watchlist" className="inline-flex shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 truncate">
            <h1 className="truncate text-lg font-semibold text-gray-900">{data?.name}</h1>
            {data?.updatedAt && (
              <p className="truncate text-sm text-gray-500">
                Mise à jour le{' '}
                {format(new Date(data.updatedAt), 'dd MMMM yyyy à HH:mm', {
                  locale: fr,
                })}
              </p>
            )}
          </div>
        </div>

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

      <div className="rounded-lg border bg-white">
        {!loading && data!.securities != null && (
          <div className="w-full">
            <TableContextHeader
              table={table}
              id={id}
              owned={owned}
              setData={setData}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
            />
            <div className="overflow-auto">
              <SimpleDataTable table={table} colSpan={columns.length} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
