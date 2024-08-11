'use client'

import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, MoreHorizontal, ListFilterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'

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

export const columns = [
  {
    accessorKey: 'symbol',
    header: SortingButton('Produit'),
    cell: ({ row }) => <div className="font-medium ">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'weight',
    header: SortingButton('Poid'),
    cell: ({ row }) => (
      <div>
        <div className="font-medium ">{round10((row.getValue('weight') as number) * 100, -1)}%</div>
      </div>
    ),
  },

  {
    accessorKey: 'last',
    header: SortingButton('Cours'),
    cell: ({ row }) => {
      const last = parseFloat(row.getValue('last'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(last)

      return <div className="font-medium ">{formatted}</div>
    },
  },

  {
    accessorKey: 'qty',
    header: 'Quantité',
    cell: ({ row }) => <div className="font-medium "> {row.getValue('qty')} </div>,
  },
  {
    accessorKey: 'bep',
    header: 'bep',
    cell: ({ row }) => <div className="font-medium "> {round10(row.getValue('bep'), -2)} </div>,
  },

  {
    accessorKey: 'total_value',
    header: 'Total',
    cell: ({ row }) => (
      <div className="font-medium "> {round10(row.getValue('total_value'), -2)} </div>
    ),
  },

  {
    id: 'retour',
    header: 'Retour',
    cell: ({ row }) => (
      <div>
        <VariationContainer
          value={row!.original.dailyVariation}
          background={false}
          entity="€"
          className="m-0 p-0"
        />
        <VariationContainer
          value={row!.original.dailyVariationPercent}
          background={false}
          className="m-0 p-0"
        />
      </div>
    ),
  },
]
