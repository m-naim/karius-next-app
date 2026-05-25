'use client'

import * as React from 'react'
import { Column, ColumnDef } from '@tanstack/react-table'
import {
  ChevronUp,
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  ListFilterIcon,
  Pencil,
  Trash,
  EllipsisVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import TransactionDialogue from '../transactionDialogue'
import { deleteTransaction, modifyTransactionApi } from '@/services/portfolioService'
import { formatDate } from '@/lib/formatDate'

type FiltrProps = {
  column: Column<Transaction, string>
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

interface Transaction {
  date: string
  entryDate?: string
  symbol: string
  price: number
  qty: number
  fees: string
  total: string
  type: string
  id: string
}

export const columns = (
  id,
  owned,
  modifyTransactionHandler,
  deleteTransactionHandler
): ColumnDef<Transaction, string>[] => [
  {
    accessorKey: 'date',
    header: SortingButton('Date effectif', false),
    cell: ({ row }) => <div className="">{row.getValue('date')}</div>,
  },
  {
    accessorKey: 'entryDate',
    header: SortingButton('Ajouté le', false),
    cell: ({ row }) => {
      const val = row.getValue('entryDate')
      return (
        <div className="text-xs italic text-muted-foreground">
          {val ? formatDate(val as string) : '-'}
        </div>
      )
    },
  },

  {
    accessorKey: 'symbol',
    header: SortingButton('Produit'),
    cell: ({ row }) => <div className="capitalize">{row.getValue('symbol')}</div>,
  },

  {
    accessorKey: 'price',
    header: SortingButton('Prix', false),
    cell: ({ row }) => {
      const last = parseFloat(row.getValue('price'))

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
    header: SortingButton('Quantité', false),
    cell: ({ row }) => {
      const qty = parseFloat(row.getValue('qty'))

      // Format the prix as a dollar prix
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        signDisplay: 'always',
      }).format(qty)

      return <div className="font-medium ">{formatted}</div>
    },
  },

  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => {
      return (
        owned && (
          <div className="flex">
            <TransactionDialogue
              key={row!.original.id}
              data-umami-event="portfolio-transaction-update"
              Trigger={(props) => (
                <div {...props} className="cursor-pointer p-1 hover:bg-muted rounded-md">
                  <EllipsisVertical size={16} />
                </div>
              )}
              initialData={{
                id: row!.original.id,
                type: row!.original.price > 0 ? 'Acheter' : 'Vendre',
                ticker: row!.original.symbol,
                date: row!.original.date,
                quantity: row!.original.qty,
                prix: row!.original.price,
              }}
              totalPortfolioValue={0}
              deleteHandler={deleteTransactionHandler}
              modifyHandler={modifyTransactionHandler}
            />
          </div>
        )
      )
    },
  },
]
