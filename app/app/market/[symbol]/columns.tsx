'use client'

import * as React from 'react'
import { Column, ColumnDef, GroupColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { round10 } from '@/lib/decimalAjustement'
import { percentVariation } from '@/lib/math'
import { security } from 'app/app/watchlist/[id]/data/security'
import { cn } from '@/lib/utils'

type FiltrProps = {
  column: Column<security, string>
}

const SortingButton = (title, alignRight = false) => {
  return function GhostButton({ column }: FiltrProps) {
    return (
      <div className={cn("flex w-full items-center", alignRight ? "justify-end" : "justify-start")}>
        <Button
          className={cn(
            "text-xs capitalize px-2 h-8 font-semibold",
            alignRight ? "-mr-2 text-right" : "-ml-2 text-left"
          )}
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {alignRight ? (
            <>
              {column.getIsSorted() === 'asc' ? <ChevronUp className="mr-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {column.getIsSorted() === 'desc' ? <ChevronDown className="mr-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {!column.getIsSorted() ? <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {title}
            </>
          ) : (
            <>
              {title}
              {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {!column.getIsSorted() ? <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0" /> : null}
            </>
          )}
        </Button>
      </div>
    )
  }
}

export const columns = (selectedPeriod, allWatchlists = []): ColumnDef<security, any>[] => {
  const cols: ColumnDef<security, any>[] = [
    {
      accessorKey: 'symbol',
      header: SortingButton('Actif'),
      footer: (info) => (
        <div className="text-[10px]">Total: {info.table.getFilteredRowModel().rows.length}</div>
      ),
      cell: ({ row }) => {
        const t = row.original.symbol.split('.')
        let ticker = t[0]
        if (t[1] == 'PA') ticker = 'xpar:' + ticker

        return (
          <div className="flex items-center justify-between pr-2">
            <div className="flex gap-2 items-center">
              <img
                className="h-5 w-5 shrink-0 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20"
                src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
                alt=""
              />
              <div className="flex flex-col">
                <span className="max-w-[80px] truncate text-xs font-semibold md:max-w-[150px]">
                  {row.original.longname}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">{row.original.symbol}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100">
              <a 
                target="_blank" 
                href={`https://www.gurufocus.com/stock/${ticker}`}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Voir sur GuruFocus"
                aria-label="Voir sur GuruFocus"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )
      },
    },

    {
      accessorKey: 'weight',
      header: SortingButton('Poids', true),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm font-medium">
          {round10((row.getValue('weight') as number) * 100, -4)}%
        </div>
      ),
    },
    {
      accessorKey: 'regularMarketPrice',
      header: SortingButton('Prix', true),
      cell: ({ row }) => {
        const prix = parseFloat(row.getValue('regularMarketPrice'))

        const formatted = new Intl.NumberFormat('fr-Fr', {
          style: 'currency',
          currency: row.original.currency || 'EUR',
          currencyDisplay: 'narrowSymbol',
        }).format(prix)

        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm font-medium">
            {formatted}
          </div>
        )
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
      header: SortingButton('Variation', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const avg =
          rows.reduce((acc, row) => {
            const val = row.getValue('variation') as number
            return isNaN(val) || val === -10000 ? acc : acc + val
          }, 0) / rows.filter((r) => !isNaN(r.getValue('variation') as number)).length
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={avg}
              entity="%"
              background={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        )
      },
      cell: ({ row }) => {
        let chg = row.original.regularMarketChangePercent

        if (selectedPeriod != '1d') {
          const variations = row.original?.variations as Record<string, number>
          chg = variations != null ? variations[selectedPeriod] : NaN
        }

        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
            <VariationContainer
              value={chg}
              entity="%"
              background={false}
              className="m-0 p-0 text-[11px]"
            />
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const val = row.getValue(id) as number
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'positive') return val > 0
          if (filter === 'negative') return val < 0
          if (filter === 'flat') return val === 0
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },

    {
      accessorKey: 'trailingPE',
      header: SortingButton('P/E', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('trailingPE'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('trailingPE') as number) || 0), 0) /
          validRows.length
        return <div className="text-right font-mono tabular-nums px-2 py-1 text-[10px]">{round10(avg, -2) || ''}</div>
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase">
          {round10(row.getValue('trailingPE'), -2) || 'N/A'}
        </div>
      ),
      filterFn: (row, id, value) => {
        const val = row.getValue(id) as number
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'value') return val < 15
          if (filter === 'fair') return val >= 15 && val <= 25
          if (filter === 'growth') return val > 25
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },
    {
      accessorKey: 'forwardPE',
      header: SortingButton('P/E Fwd', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('forwardPE'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('forwardPE') as number) || 0), 0) /
          validRows.length
        return <div className="text-right font-mono tabular-nums px-2 py-1 text-[10px]">{round10(avg, -2) || ''}</div>
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase">
          {round10(row.getValue('forwardPE'), -2) || 'N/A'}
        </div>
      ),
      filterFn: (row, id, value) => {
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true
        const matches = values.includes(row.getValue(id))
        return mode === 'is' ? matches : !matches
      },
    },

    {
      accessorKey: 'dividendYield',
      header: SortingButton('Rendement Div.', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('dividendYield'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('dividendYield') as number) || 0), 0) /
          validRows.length
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-[10px]">
            <VariationContainer
              value={round10(avg, -2) || 0}
              entity="%"
              background={false}
              vaiationColor={false}
              className="m-0 p-0"
            />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={round10(row.getValue('dividendYield'), -2) || 0}
            entity="%"
            background={false}
            vaiationColor={false}
            className="m-0 p-0 text-[11px]"
          />
        </div>
      ),
      filterFn: (row, id, value) => {
        const val = row.getValue(id) as number
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'high') return val >= 4
          if (filter === 'medium') return val >= 2 && val < 4
          if (filter === 'low') return val < 2
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },
    {
      accessorKey: 'linearity10y',
      header: SortingButton('Linéarité', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const validRows = rows.filter((r) => !!r.getValue('linearity10y'))
        const avg =
          rows.reduce((acc, row) => acc + ((row.getValue('linearity10y') as number) || 0), 0) /
          validRows.length
        return <div className="text-right font-mono tabular-nums px-2 py-1 text-[10px]">{round10(avg, -2) || ''}</div>
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={(row.getValue('linearity10y') as number) * 100 || 0}
            entity="%"
            background={false}
            vaiationColor={false}
            sign={false}
            className="m-0 p-0 text-[10px]"
          />
        </div>
      ),
      filterFn: (row, id, value) => {
        const val = (row.getValue(id) as number) * 100
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'high') return val >= 90
          if (filter === 'good') return val >= 70 && val < 90
          if (filter === 'low') return val < 70
          return true
        })

        return mode === 'is' ? matches : !matches
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
        if (chg === -10000) return -10000
        const lin = row.linearity10y || 0
        return chg * lin
      },
      id: 'ret_lin',
      header: SortingButton('Score (Ret×Lin)', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const filteredRows = rows.filter(
          (r) => !isNaN(r.getValue('ret_lin') as number) && r.getValue('ret_lin') !== -10000
        )
        const avg =
          rows.reduce((acc, row) => {
            const val = row.getValue('ret_lin') as number
            return isNaN(val) || val === -10000 ? acc : acc + val
          }, 0) / filteredRows.length
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={avg}
              entity="%"
              background={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const val = row.getValue('ret_lin') as number
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
            <VariationContainer
              value={val}
              entity="%"
              background={false}
              className="m-0 p-0 text-[11px]"
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'marketCap',
      header: SortingButton('Capitalisation', true),
      cell: ({ row }) => {
        const cap = parseFloat(row.getValue('marketCap'))
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase">
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
      accessorFn: (row) => {
        return row?.lastYearFundamental?.roa || 0
      },
      id: 'roa',
      header: SortingButton('ROA', true),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={(row.original?.lastYearFundamental?.roa || 0) * 100}
            entity="%"
            background={false}
            vaiationColor={false}
            className="m-0 p-0 text-[11px]"
          />
        </div>
      ),
      filterFn: (row, id, value) => {
        const val = (row.original?.lastYearFundamental?.roa || 0) * 100
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'high') return val >= 15
          if (filter === 'good') return val >= 5 && val < 15
          if (filter === 'low') return val < 5
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },

    {
      accessorFn: (row) => {
        return row?.lastYearFundamental?.roe || 0
      },
      id: 'roe',
      header: SortingButton('ROE', true),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={(row.original?.lastYearFundamental?.roe || 0) * 100}
            entity="%"
            background={false}
            vaiationColor={false}
            className="m-0 p-0 text-[11px]"
          />
        </div>
      ),
      filterFn: (row, id, value) => {
        const val = (row.original?.lastYearFundamental?.roe || 0) * 100
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'high') return val >= 15
          if (filter === 'good') return val >= 5 && val < 15
          if (filter === 'low') return val < 5
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },

    {
      accessorKey: 'sector',
      header: SortingButton('Secteur'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('sector')}</div>,
      filterFn: (row, id, value) => {
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true
        const matches = values.includes(row.getValue(id))
        return mode === 'is' ? matches : !matches
      },
    },
    {
      accessorKey: 'industry',
      header: SortingButton('Industrie'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('industry')}</div>,
      filterFn: (row, id, value) => {
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true
        const matches = values.includes(row.getValue(id))
        return mode === 'is' ? matches : !matches
      },
    },

    {
      accessorFn: (row) => {
        return percentVariation(row.forwardPE, row.trailingPE)
      },
      id: 'growth',
      header: SortingButton('Croiss. Est.', true),
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={percentVariation(row.getValue('forwardPE'), row.getValue('trailingPE'))}
            entity="%"
            background={false}
            className="m-0 p-0 text-[11px]"
          />
        </div>
      ),

      filterFn: (row, id, value) => {
        const val = row.getValue(id) as number
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }

        if (!values || values.length === 0) return true

        const matches = values.some((filter: string) => {
          if (filter === 'hyper') return val > 20
          if (filter === 'steady') return val >= 10 && val <= 20
          if (filter === 'slow') return val < 10
          return true
        })

        return mode === 'is' ? matches : !matches
      },
    },
  ]

  return cols
}
