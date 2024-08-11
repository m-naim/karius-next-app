'use client'

import * as React from 'react'
import { Column, ColumnDef, GroupColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Actions } from './Actions'
import { security } from '../data/security'

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

export const columns = (id, owned): ColumnDef<security, string>[] => {
  return [
    {
      accessorKey: 'symbol',
      header: SortingButton('Action'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-md lowercase text-black">{row.original.longname}</span>
          <span className="caspanitalize text-xs text-black">{row.original.symbol}</span>
        </div>
      ),
    },

    {
      accessorKey: 'score.global',
      id: 'scoreGlobal',
      header: SortingButton('score'),
      cell: ({ row }) => <div className="lowercase">{row.getValue('scoreGlobal')}</div>,
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
      accessorKey: 'regularMarketChangePercent',
      header: SortingButton('Variation'),
      cell: ({ row }) => {
        const chg = parseFloat(row.getValue('regularMarketChangePercent'))
        const formatted = new Intl.NumberFormat('fr-FR', {
          maximumSignificantDigits: 2,
        }).format(chg)

        return <div className="font-medium">{formatted}%</div>
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
            {owned && <Actions id={id} symbol={row.original.symbol}></Actions>}
          </div>
        )
      },
    },
  ]
}
