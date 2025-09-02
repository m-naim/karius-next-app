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
import { tr } from 'date-fns/locale'

// Fonction pour générer une couleur basée sur une chaîne
export const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 45%)`
}

// Fonction pour obtenir les initiales
const getInitials = (str: string) => {
  return str
    .split(/\W/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export interface PortfolioSecurity {
  symbol: string
  weight: number
  totalValue: number
  last: number
  qty: number
  bep: number
  retour: number
  sector?: string
  industry?: string
}

type FiltrProps = {
  column: Column<PortfolioSecurity>
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

        {activateFilter ? <FilterButton column={column}></FilterButton> : null}
      </div>
    )
  }
}

export const columns = [
  {
    accessorKey: 'symbol',
    header: SortingButton('Produit'),
    cell: ({ row }) => {
      const symbol = row.getValue('symbol') as string
      const color = stringToColor(symbol)
      const initials = getInitials(symbol)

      return (
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{symbol}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.shortname || 'Non disponible'}
            </span>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'weight',
    header: SortingButton('Poid', false),
    cell: ({ row }) => (
      <div className="font-medium">{round10((row.getValue('weight') as number) * 100, -1)}%</div>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'last',
    header: SortingButton('Cours', false),
    cell: ({ row }) => {
      const last = parseFloat(row.getValue('last'))
      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(last)
      return <div className="font-medium">{formatted}</div>
    },
    enableHiding: true,
  },
  {
    accessorKey: 'qty',
    header: 'Quantité',
    cell: ({ row }) => <div className="font-medium">{row.getValue('qty')}</div>,
    enableHiding: true,
  },
  {
    accessorKey: 'bep',
    header: 'BEP',
    cell: ({ row }) => (
      <div className="font-medium">{round10(row.getValue('bep'), -2).toLocaleString()} €</div>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'totalValue',
    header: SortingButton('Total', false),
    cell: ({ row }) => (
      <div className="font-medium">
        {round10(row.getValue('totalValue'), -2).toLocaleString()} €
      </div>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'variationPercent',
    header: SortingButton('Retour', false),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <VariationContainer
          value={row!.original.variation}
          background={false}
          entity="€"
          className="m-0 p-0"
        />
        <VariationContainer
          value={row!.original.variationPercent}
          background={false}
          className="m-0 p-0"
        />
      </div>
    ),
    enableHiding: true,
  },
]
