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
  shortname?: string
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

export const columns = (selectedPeriod?: any, baseCurrency = 'EUR', useNativeCurrency = false, own = true): any[] => {
  const colList: any[] = [
    {
      accessorKey: 'symbol',
      header: SortingButton(own ? 'Produit x Quantité' : 'Produit'),
      cell: ({ row }) => {
        const symbol = row.getValue('symbol') as string

        return (
          <div className="flex max-w-[110px] sm:max-w-[160px] md:max-w-[220px] min-w-0 items-center gap-1.5 overflow-hidden">
            <img
              className="h-5 w-5 shrink-0 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20"
              src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
              alt={row.original.symbol}
            />
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="truncate text-xs font-semibold flex items-center gap-1">
                <span className="truncate">{symbol} {own && row.original.qty ? `x ${row.original.qty}` : ''}</span>
                {row.original.qualityMetrics?.hasFundamentals && (
                  <span title="Données fondamentales disponibles" className="shrink-0"><FileText className="h-3 w-3 text-blue-500" /></span>
                )}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
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
      header: SortingButton('Poids', false),
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        return (
          <div className="flex flex-col">
            <div className="font-medium">
              {round10((row.getValue('weight') as number) * 100, -1)}%
            </div>
            {own && row.original.totalValue != null && row.original.qty !== 0 && (
              <div className="text-muted-foreground">{round10(row.original.totalValue, -2).toLocaleString() + ' ' + symbol}</div>
            )}
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
  ]

  if (own) {
    colList.push({
      accessorKey: 'bep',
      header: 'PRU',
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        const bepVal = useNativeCurrency && row.original.nativeBep != null ? row.original.nativeBep : row.getValue('bep')
        return (
          <div className="font-medium">{row.original.qty === 0 || bepVal == null ? '-' : round10(bepVal as number, -2).toLocaleString() + ' ' + symbol}</div>
        )
      },
      enableHiding: false,
    })
  }

  colList.push({
    accessorKey: 'variationPercent',
    header: SortingButton('Retour', false),
    cell: ({ row }) => {
      const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
      const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
      
      let varValue = row!.original.variation
      let varPercent = row!.original.variationPercent
      
      return (
        <div className="flex flex-col gap-1">
          {own && varValue != null && row.original.qty !== 0 && (
            <VariationContainer
              value={varValue}
              background={false}
              entity={symbol}
              className="m-0 p-0"
            />
          )}
          {varPercent != null && (
            <VariationContainer
              value={varPercent}
              background={false}
              className="m-0 p-0"
            />
          )}
        </div>
      )
    },
    enableHiding: false,
  })
  colList.push(
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
            {own && (
              <VariationContainer
                value={chg * row.original.weight}
                entity="%"
                background={false}
                className="m-0 p-0 py-0"
              />
            )}
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
    }
  )

  return colList
}
