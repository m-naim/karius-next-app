'use client'

import * as React from 'react'
import { Column, ColumnDef, GroupColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { round10 } from '@/lib/decimalAjustement'
import { percentVariation } from '@/lib/math'
import { security } from 'app/app/watchlist/[id]/data/security'

type FiltrProps = {
  column: Column<security, string>
}

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
      </div>
    )
  }
}

export const columns = (selectedPeriod): ColumnDef<security, any>[] => {
  const cols: ColumnDef<security, any>[] = [
    {
      accessorKey: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const t = row.original.symbol.split('.')
        let ticker = t[0]

        if (t[1] == 'PA') ticker = 'xpar:' + ticker

        return (
          <div className="flex">
            <a target="_blank" href={`https://www.gurufocus.com/stock/${ticker}`}>
              guru
            </a>
          </div>
        )
      },
    },

    {
      accessorKey: 'symbol',
      header: SortingButton('Action'),
      footer: (info) => (
        <div className="text-[10px]">Total: {info.table.getFilteredRowModel().rows.length}</div>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <img
            className="h-4 w-4"
            src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
            alt=""
          />

          <div className="flex flex-col">
            <span className="max-w-[80px] truncate text-[11px] lowercase md:max-w-[150px]">
              {row.original.longname}
            </span>

            <span className="text-[10px] text-muted-foreground">{row.original.symbol}</span>
          </div>
        </div>
      ),
    },

    {
      accessorKey: 'weight',
      header: SortingButton('poids'),
      cell: ({ row }) => (
        <div className="font-medium">{round10(row.getValue('weight') * 100, -4)}%</div>
      ),
    },
    {
      accessorKey: 'regularMarketPrice',
      header: SortingButton('prix'),
      cell: ({ row }) => {
        const prix = parseFloat(row.getValue('regularMarketPrice'))

        // Format the prix as a dollar prix
        const formatted = new Intl.NumberFormat('fr-Fr', {
          style: 'currency',
          currency: row.original.currency || 'EUR',
          currencyDisplay: 'narrowSymbol',
        }).format(prix)

        return <div className="font-medium">{formatted}</div>
      },
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
      header: SortingButton('Variation'),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const avg =
          rows.reduce((acc, row) => {
            const val = row.getValue('variation') as number
            return isNaN(val) || val === -10000 ? acc : acc + val
          }, 0) / rows.filter((r) => !isNaN(r.getValue('variation') as number)).length
        return (
          <VariationContainer
            value={avg}
            entity="%"
            background={false}
            className="m-0 p-0 text-[10px]"
          />
        )
      },
      cell: ({ row }) => {
        let chg = row.original.regularMarketChangePercent

        if (selectedPeriod != '1d') {
          const variations = row.original?.variations as Record<string, number>
          chg = variations != null ? variations[selectedPeriod] : NaN
        }

        return (
          <VariationContainer
            value={chg}
            entity="%"
            background={false}
            className="m-0 p-0 py-1 text-[11px]"
          />
        )
      },
    },

    {
      accessorKey: 'trailingPE',
      header: SortingButton('P/E'),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('trailingPE'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('trailingPE') as number) || 0), 0) /
          validRows.length
        return <div className="text-[10px]">{round10(avg, -2) || ''}</div>
      },
      cell: ({ row }) => (
        <div className="lowercase">{round10(row.getValue('trailingPE'), -2) || 'N/A'}</div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'forwardPE',
      header: SortingButton('P/E Forward'),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('forwardPE'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('forwardPE') as number) || 0), 0) /
          validRows.length
        return <div className="text-[10px]">{round10(avg, -2) || ''}</div>
      },
      cell: ({ row }) => (
        <div className="lowercase">{round10(row.getValue('forwardPE'), -2) || 'N/A'}</div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    {
      accessorKey: 'dividendYield',
      header: SortingButton('Dividend Yield'),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('dividendYield'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('dividendYield') as number) || 0), 0) /
          validRows.length
        return (
          <VariationContainer
            value={round10(avg, -2) || 0}
            entity="%"
            background={false}
            vaiationColor={false}
            className="m-0 p-0 text-[10px]"
          />
        )
      },
      cell: ({ row }) => (
        <VariationContainer
          value={round10(row.getValue('dividendYield'), -2) || 0}
          entity="%"
          background={false}
          vaiationColor={false}
          className="m-0 p-0 py-1 text-[11px]"
        />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'marketCap',
      header: SortingButton('capitalisation'),
      cell: ({ row }) => {
        const cap = parseFloat(row.getValue('marketCap'))
        return (
          <div className="lowercase">
            {new Intl.NumberFormat('fr-Fr', {
              style: 'decimal',
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'long',
            }).format(cap)}
          </div>
        )
      },
    },

    {
      accessorKey: 'sector',
      header: SortingButton('secteur'),
      cell: ({ row }) => <div className="lowercase">{row.getValue('sector')}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'industry',
      header: SortingButton('industrie'),
      cell: ({ row }) => <div className="lowercase">{row.getValue('industry')}</div>,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },

    {
      accessorFn: (row) => {
        return percentVariation(row.forwardPE, row.trailingPE)
      },
      id: 'growth',
      header: SortingButton('Estimated Growth'),
      cell: ({ row }) => (
        <VariationContainer
          value={percentVariation(row.getValue('forwardPE'), row.getValue('trailingPE'))}
          entity="%"
          background={false}
          className="m-0 p-0 py-1 text-[11px]"
        />
      ),

      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
  ]

  return cols
}
