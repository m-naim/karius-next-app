'use client'

import React, { useLayoutEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface watchList {
  name: string
  securities: security[]
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

  const table = useReactTable<security>({
    data: data!.securities,
    columns: columns(id, owned),
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

  useLayoutEffect(() => {
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
    <div>loading ...</div>
  ) : (
    <>
      <SectionContainer className="flex w-full items-center justify-between">
        <div className="flex items-center self-start">
          <Link href={`/app/watchlist`} className="h-fit">
            <Button variant={'ghost'}>
              <ArrowLeft />
            </Button>
          </Link>
          <h1>{data?.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          {owned && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={'sm'} variant="ghost">
                    <EllipsisVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleDeleteClick}>
                      <Trash2 className="h-4 text-red-600" strokeWidth={1} />
                      <span>Supprimer</span>
                      <DropdownMenuShortcut>ctrl + d</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </SectionContainer>
      <SectionContainer>
        {!loading && data!.securities != null && (
          <div className="w-full">
            <TableContextHeader table={table} id={id} owned={owned} />
            <SimpleDataTable table={table} colSpan={columns.length} />
          </div>
        )}
      </SectionContainer>
    </>
  )
}
