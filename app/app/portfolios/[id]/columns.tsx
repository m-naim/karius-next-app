'use client'

import * as React from 'react'
import { Column, sortingFns } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, ListFilterIcon, FileText } from 'lucide-react'

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
  qualityMetrics?: any
  currency?: string
  nativeBep?: number
}

type FiltrProps = {
  column: Column<PortfolioSecurity>
}

const FilterButton = ({ column }: FiltrProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="mx-1 p-0" aria-label="Filtrer cette colonne">
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
          aria-label={`Trier par ${title}`}
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

export const columns = (selectedPeriod, baseCurrency = 'EUR', useNativeCurrency = false): any[] => {
  return [
    {
      accessorKey: 'symbol',
      header: SortingButton('Produit x Quantité'),
      cell: ({ row }) => {
        const symbol = row.getValue('symbol') as string

        return (
          <div className="flex max-w-20 items-center gap-3 overflow-hidden md:max-w-40">
            <img
              className="h-6 w-6"
              src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
              alt={row.original.symbol}
            />
            <div className="flex flex-col">
              <span className="font-medium flex items-center gap-1">
                {symbol} {row.original.qty !== 0 ? `x ${row.original.qty}` : ''}
                {row.original.qualityMetrics?.hasFundamentals && (
                  <span title="Données fondamentales disponibles"><FileText className="h-3 w-3 text-blue-500" /></span>
                )}
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
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        return (
          <div className="flex flex-col">
            <div className="font-medium">
              {round10((row.getValue('weight') as number) * 100, -1)}%
            </div>
            <div className="text-muted-foreground">{row.original.qty === 0 ? '-' : round10(row.original.totalValue, -2).toLocaleString() + ' ' + symbol}</div>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: 'last',
      header: SortingButton('Cours', false),
      cell: ({ row }) => {
        const last = parseFloat(row.getValue('last'))
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const formatted = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: currencyToUse,
        }).format(last)
        return <div className="font-medium">{formatted}</div>
      },
      enableHiding: true,
    },

    {
      accessorKey: 'bep',
      header: 'PRU',
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        const bepVal = useNativeCurrency && row.original.nativeBep != null ? row.original.nativeBep : row.getValue('bep')
        return (
          <div className="font-medium">{row.original.qty === 0 ? '-' : round10(bepVal as number, -2).toLocaleString() + ' ' + symbol}</div>
        )
      },
      enableHiding: false,
    },

    {
      accessorKey: 'variationPercent',
      header: SortingButton('Retour', false),
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        
        let varValue = row!.original.variation
        let varPercent = row!.original.variationPercent
        
        // If native currency is requested, we would theoretically calculate variation in native currency here
        // For now, we assume the backend provides it, or we display the same percent (native percent is roughly same for stocks without FX effect, but we would need to calculate it properly. 
        // We will just change the symbol for now, a proper implementation would fetch native variations.)
        
        return (
          <div className="flex flex-col gap-1">
            {row.original.qty === 0 ? (
              <div className="text-muted-foreground ml-2">-</div>
            ) : (
              <VariationContainer
                value={varValue}
                background={false}
                entity={symbol}
                className="m-0 p-0"
              />
            )}
            <VariationContainer
              value={varPercent}
              background={false}
              className="m-0 p-0"
            />
          </div>
        )
      },
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
      sortingFns: (rowA, rowB) => {
        const varA = selectedPeriod !== '1d' ? (rowA.original?.variations?.[selectedPeriod] ?? NaN) : (rowA.original?.regularMarketChangePercent ?? 0)
        const varB = selectedPeriod !== '1d' ? (rowB.original?.variations?.[selectedPeriod] ?? NaN) : (rowB.original?.regularMarketChangePercent ?? 0)
        const a = (isNaN(varA) ? -10000 : varA) * (rowA.original?.weight ?? 0)
        const b = (isNaN(varB) ? -10000 : varB) * (rowB.original?.weight ?? 0)
        return a - b
      },
    },
    {
      accessorFn: (row) => row.qualityMetrics?.revenueGrowth5yAvg,
      id: 'revGrowth',
      header: SortingButton('Croissance CA (5a)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.revenueGrowth5yAvg
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0" />
      },
    },
    {
      accessorFn: (row) => row.qualityMetrics?.roic5yAvg,
      id: 'roic',
      header: SortingButton('ROIC (5a)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.roic5yAvg
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0" />
      },
    },
    {
      accessorFn: (row) => row.qualityMetrics?.pe5yAvgProxy,
      id: 'pe5y',
      header: SortingButton('PE (5a proxy)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.pe5yAvgProxy
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <div className="font-medium">{val.toFixed(1)}x</div>
      },
    },
  ]
}
