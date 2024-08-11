'use client'

import * as React from 'react'
import { Column, ColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, MoreHorizontal, ListFilterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { format } from 'date-fns/format'

type FiltrProps = {
  column: Column<unknown>
}

const FilterButton = ({ column }: FiltrProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="mx-1 p-0">
        <ListFilterIcon
          className={cn(' h-4 w-4', column?.getFilterValue() != null ? 'text-primary' : '')}
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

const SortingButton = (title, activateFilter = true) => {
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

        {activateFilter && <FilterButton column={column}></FilterButton>}
      </div>
    )
  }
}

export const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'date',
    header: SortingButton('date', false),
    cell: ({ row }) => (
      <div className="">
        {format(new Date((row.getValue('date') as number) * 1000), 'yyyy-MM-dd')}
      </div>
    ),
  },

  {
    accessorKey: 'symbol',
    header: SortingButton('Produit'),
    cell: ({ row }) => <div className="capitalize">{row.getValue('symbol')}</div>,
  },

  {
    accessorKey: 'amountByShare',
    header: SortingButton('montant par actif', false),
    cell: ({ row }) => {
      const last = parseFloat(row.getValue('amountByShare'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(last)

      return <div className="font-medium ">{formatted}</div>
    },
  },

  {
    accessorKey: 'totalAmount',
    header: SortingButton('Total', false),
    cell: ({ row }) => {
      const qty = parseFloat(row.getValue('totalAmount'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        signDisplay: 'always',
      }).format(qty)

      return <div className="font-medium ">{formatted}</div>
    },
  },
]
