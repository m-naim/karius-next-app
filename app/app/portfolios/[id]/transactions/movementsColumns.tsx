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

export const MovementsColumns = (owned: boolean): ColumnDef<unknown>[] => {
  const columns: ColumnDef<unknown>[] = [
    {
      accessorKey: 'date',
      header: SortingButton('date', false),
      cell: ({ row }) => <div className="">{row.getValue('date')}</div>,
    },

    {
      header: 'Opération',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('action') || (parseFloat(row.getValue('amount')) > 0 ? 'Dépôt' : 'Retrait')}
        </div>
      ),
    },
  ]

  if (owned) {
    columns.push({
      accessorKey: 'amount',
      header: SortingButton('Montant', false),
      cell: ({ row }) => {
        const last = parseFloat(row.getValue('amount'))

        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR',
        }).format(last)

        return <div className="font-medium ">{formatted}</div>
      },
    })
  }

  return columns
}
