'use client'

import * as React from 'react'
import { Column, sortingFns } from '@tanstack/react-table'
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
import { stringToColor } from '@/lib/colors'

// Fonction pour générer une couleur basée sur une chaîne

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

export const columns = (selectedPeriod): any[] => {
  return [
    {
      accessorKey: 'symbol',
      header: SortingButton('Produit x Quantité'),
      cell: ({ row }) => {
        const symbol = row.getValue('symbol') as string
        const color = stringToColor(symbol)
        const initials = getInitials(symbol)

        return (
          <div className="flex max-w-20 items-center gap-3 overflow-hidden md:max-w-40">
            <div
              className="hidden h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white md:flex"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">
                {symbol} x {row.original.qty}
              </span>
              <span className="max-w-20 overflow-ellipsis text-xs text-muted-foreground">
                {row.original.shortname || ''}
              </span>
            </div>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: 'weight',
      header: SortingButton('Poid / total', false),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium">
            {round10((row.getValue('weight') as number) * 100, -1)}%
          </div>
          <div>{round10(row.original.totalValue, -2).toLocaleString()} €</div>
        </div>
      ),
      enableHiding: false,
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
      accessorKey: 'bep',
      header: 'PRU',
      cell: ({ row }) => {
        return (
          <div className="font-medium">{round10(row.getValue('bep'), -2).toLocaleString()} €</div>
        )
      },
      enableHiding: false,
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
      enableHiding: false,
    },
    {
      accessorFn: (row) => {
        let chg = row.regularMarketChangePercent
        if (selectedPeriod != '1d') {
          const variations = row.variations as Record<string, number>
          if (variations != null) {
            chg = variations[selectedPeriod]
          } else {
            chg = -10000
          }
        }
        return chg
      },
      id: 'variation',
      header: SortingButton('Variation', false),
      cell: ({ row }) => {
        let chg = row.original.dailyVariationPercent

        if (selectedPeriod != '1d') {
          const variations = row.original?.variations as Record<string, number>
          chg = variations != null ? variations[selectedPeriod] : NaN
        }

        return (
          <div className="flex flex-col">
            <VariationContainer
              value={chg}
              entity="%"
              background={false}
              className="m-0 p-0 py-0"
            />
            <VariationContainer
              value={chg * row.original.weight}
              entity="%"
              background={false}
              className="m-0 p-0 py-0"
            />
          </div>
        )
      },
      sortingFns: (rowA, rowB, columnId) => {
        const a = rowA.variations[selectedPeriod] * rowA.original.weight
        const b = rowB.variations[selectedPeriod] * rowB.original.weight
        return a - b
      },
    },
  ]
}
