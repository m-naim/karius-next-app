'use client'

import * as React from 'react'
import { Column, ColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, MoreHorizontal, ListFilterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type FiltrProps = {
  column: Column<unknown>
}

const FilterButton = ({ column }: FiltrProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="mx-1 p-0">
        <ListFilterIcon
          className={cn(' h-4 w-4', column?.getFilterValue() != null ? 'text-primary-600' : '')}
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <Input
        placeholder="filtrer..."
        value={(column?.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
    </DropdownMenuContent>
  </DropdownMenu>
)

const SortingButton = (title) => {
  return function GhostButton({ column }: FiltrProps) {
    return (
      <div className="flex">
        <Button
          className="p-0 capitalize"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {title}
          {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : null}
          {column.getIsSorted() === 'desc' ? <ChevronDown className="ml-2 h-4 w-4" /> : null}
          {!column.getIsSorted() ? <ArrowUpDown className="ml-2 h-4 w-4" /> : null}
        </Button>

        <FilterButton column={column}></FilterButton>
      </div>
    )
  }
}

export const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'symbol',
    header: SortingButton('symbol'),
    cell: ({ row }) => <div className="capitalize">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'longname',
    header: SortingButton('Nom de société'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('longname')}</div>,
  },
  {
    accessorKey: 'score',
    header: SortingButton('score'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('score')}</div>,
  },
  {
    accessorKey: 'regularMarketPrice',
    header: SortingButton('prix'),
    cell: ({ row }) => {
      const prix = parseFloat(row.getValue('regularMarketPrice'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(prix)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'regularMarketChange',
    header: SortingButton('chg'),
    cell: ({ row }) => {
      const chg = parseFloat(row.getValue('regularMarketChange'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(chg)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'sector',
    header: SortingButton('secteur'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('sector')}</div>,
  },
  {
    accessorKey: 'industry',
    header: SortingButton('industrie'),
    cell: ({ row }) => <div className="lowercase">{row.getValue('industry')}</div>,
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
            <DropdownMenuItem>Ajouter une Alerte</DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem>Tager Prochain achat</DropdownMenuItem>
            <DropdownMenuItem>Retirer de la liste</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
