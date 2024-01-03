'use client'

import * as React from 'react'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const data = [
  {
    id: 'm5gr84i9',
    prix: 316,
    chg: 1,
    score: 100,
    symbol: 'MSFT',
    societe: 'ken99',
  },
  {
    id: '3u1reuv4',
    prix: 242,
    chg: 5,
    score: 100,
    symbol: 'GOOGL',
    societe: 'Abe45',
  },
  {
    id: 'derv1ws0',
    prix: 837,
    chg: 1,
    score: 100,
    symbol: 'ADBE',
    societe: 'Monserrat44',
  },
  {
    id: '5kma53ae',
    prix: 874,
    chg: 10,
    score: 100,
    symbol: 'FTNT',
    societe: 'Silas22',
  },
  {
    id: 'bhqecj4p',
    prix: 721,
    chg: 12,
    score: 100,
    symbol: 'V',
    societe: 'carmella',
  },
]

export type Payment = {
  id: string
  prix: number
  symbol: string
  societe: string
}

const FilterButton = (title) => {
  return function GhostButton({ column }) {
    return (
      <Button
        className="p-0"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  }
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'symbol',
    header: FilterButton('mark'),
    cell: ({ row }) => <div className="capitalize">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'symbol',
    header: FilterButton('symbol'),
    cell: ({ row }) => <div className="capitalize">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'societe',
    header: FilterButton('societe'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('societe')}</div>,
  },
  {
    accessorKey: 'score',
    header: FilterButton('score'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('score')}</div>,
  },
  {
    accessorKey: 'prix',
    header: FilterButton('prix'),
    cell: ({ row }) => {
      const prix = parseFloat(row.getValue('prix'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(prix)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'chg',
    header: FilterButton('chg'),
    cell: ({ row }) => {
      const chg = parseFloat(row.getValue('chg'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(chg)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function WatchlistTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Ajouter un action"
          value={(table.getColumn('symbol')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('symbol')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
