'use client'

import * as React from 'react'
import { Column, ColumnDef, GroupColumnDef } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { round10 } from '@/lib/decimalAjustement'
import { percentVariation, calculateMedian } from '@/lib/math'
import { security } from 'app/app/watchlist/[id]/data/security'
import { cn } from '@/lib/utils'
import { genericNumericFilterFn } from '@/lib/table-filters'

type FiltrProps = {
  column: Column<security, string>
}

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  'Actif': 'Ticker boursier et nom officiel de la société',
  'Prix': 'Dernier cours de bourse coté en temps réel (ou à la clôture)',
  'Variation': 'Performance du cours sur la période temporelle sélectionnée',
  'Poids': 'Poids relatif en pourcentage (%) de l’action dans l’indice',
  'P/E': 'PER 12 mois glissants (Prix / Bénéfice par action TTM)',
  'P/E Fwd': 'PER estimé à 12 mois (Prix / Bénéfices futurs attendus)',
  'PE (5a proxy)': 'PER moyen lissé sur 5 ans (bénéfices moyens 5 ans)',
  'Linéarité (10a)': 'Régularité et constance de la hausse du cours sur 10 ans (R²)',
  'Score (Ret×Lin)': 'Score Horus combinant rendement annuel moyen et linéarité',
  'Yield': 'Rendement du dividende brut annuel (Dividende / Prix)',
  'ROA': 'Rentabilité des actifs totaux (Return on Assets)',
  'ROE': 'Rentabilité des capitaux propres (Return on Equity - Moat)',
  'Croissance CA': 'Taux de croissance du chiffre d’affaires sur 1 an',
  'Croissance CA (5a)': 'Taux de croissance annuel moyen du chiffre d’affaires sur 5 ans',
  'ROIC (5a)': 'Rentabilité du capital investi moyen sur 5 ans (ROIC)',
  'Cap. Boursière': 'Valorisation boursière totale (Prix × Nombre d’actions)',
}

const SortingButton = (title, alignRight = false) => {
  const desc = COLUMN_DESCRIPTIONS[title] || title
  return function GhostButton({ column }: FiltrProps) {
    return (
      <div className={cn("flex w-full items-center", alignRight ? "justify-end" : "justify-start")} title={desc}>
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
              {!column.getIsSorted() ? <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-40" /> : null}
              {title}
            </>
          ) : (
            <>
              {title}
              {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0" /> : null}
              {!column.getIsSorted() ? <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-40" /> : null}
            </>
          )}
        </Button>
      </div>
    )
  }
}

import { Actions } from 'app/app/watchlist/[id]/components/Actions'

export const columns = (selectedPeriod: any, allWatchlists: any[] = []): ColumnDef<security, any>[] => {
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
          <div className="flex max-w-[110px] sm:max-w-[160px] md:max-w-[220px] min-w-0 items-center justify-between gap-1.5 pr-1">
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              <img
                className="h-5 w-5 shrink-0 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20"
                src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
                alt=""
              />
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="truncate text-xs font-semibold flex items-center gap-1">
                  <span className="truncate">{row.original.longname}</span>
                  {row.original.qualityMetrics?.hasFundamentals && (
                    <span title="Données fondamentales disponibles" className="shrink-0"><FileText className="h-3 w-3 text-blue-500" /></span>
                  )}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground truncate">{row.original.symbol}</span>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100 shrink-0">
              <Actions
                id=""
                symbol={row.original.symbol}
                allWatchlists={allWatchlists}
                security={row.original}
              />
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
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => (r.getValue('weight') as number) * 100)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            {round10(med, -4)}%
          </div>
        ) : null
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm font-medium">
          {round10((row.getValue('weight') as number) * 100, -4)}%
        </div>
      ),
    },
    {
      accessorKey: 'regularMarketPrice',
      header: SortingButton('Prix', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => parseFloat(r.getValue('regularMarketPrice')))
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs font-medium">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', currencyDisplay: 'narrowSymbol' }).format(med)}
          </div>
        ) : null
      },
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
        const vals = rows.map((r) => r.getValue('variation') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        ) : null
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
      filterFn: genericNumericFilterFn,
    },

    {
      accessorKey: 'trailingPE',
      header: SortingButton('P/E', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => r.getValue('trailingPE') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs lowercase">
            {round10(med, -2)}
          </div>
        ) : null
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase">
          {round10(row.getValue('trailingPE'), -2) || 'N/A'}
        </div>
      ),
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'forwardPE',
      header: SortingButton('P/E Fwd', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => r.getValue('forwardPE') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs lowercase">
            {round10(med, -2)}
          </div>
        ) : null
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase">
          {round10(row.getValue('forwardPE'), -2) || 'N/A'}
        </div>
      ),
      filterFn: genericNumericFilterFn,
    },

    {
      accessorKey: 'dividendYield',
      header: SortingButton('Rendement Div.', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => r.getValue('dividendYield') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={round10(med, -2) || 0}
              entity="%"
              background={false}
              vaiationColor={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        ) : null
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
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'linearity10y',
      header: SortingButton('Linéarité', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => (r.getValue('linearity10y') as number) * 100)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              vaiationColor={false}
              sign={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        ) : null
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
      filterFn: genericNumericFilterFn,
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
        const vals = rows.map((r) => r.getValue('ret_lin') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              className="m-0 p-0 text-[11px]"
            />
          </div>
        ) : null
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
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'marketCap',
      header: SortingButton('Capitalisation', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => parseFloat(r.getValue('marketCap')))
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs lowercase">
            {new Intl.NumberFormat('fr-FR', {
              style: 'decimal',
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
              notation: 'compact',
              compactDisplay: 'long',
            }).format(med)}
          </div>
        ) : null
      },
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
      filterFn: genericNumericFilterFn,
    },
    {
      accessorFn: (row) => {
        return row?.lastYearFundamental?.roa || 0
      },
      id: 'roa',
      header: SortingButton('ROA', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => (r.original?.lastYearFundamental?.roa || 0) * 100)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              vaiationColor={false}
              className="m-0 p-0 text-[11px]"
            />
          </div>
        ) : null
      },
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
      filterFn: genericNumericFilterFn,
    },

    {
      accessorFn: (row) => {
        return row?.lastYearFundamental?.roe || 0
      },
      id: 'roe',
      header: SortingButton('ROE', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => (r.original?.lastYearFundamental?.roe || 0) * 100)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              vaiationColor={false}
              className="m-0 p-0 text-[11px]"
            />
          </div>
        ) : null
      },
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
      filterFn: genericNumericFilterFn,
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
      accessorFn: (row) => (row.qualityMetrics?.hasFundamentals || !!row.lastYearFundamental) ? 'yes' : 'no',
      id: 'hasFundamentals',
      header: SortingButton('Fondamentaux'),
      cell: ({ row }) => {
        const hasFund = row.original.qualityMetrics?.hasFundamentals || !!row.original.lastYearFundamental
        return (
          <div className="flex items-center gap-1">
            {hasFund ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FileText className="h-3.5 w-3.5" /> Dispo
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">Non</span>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        if (!value) return true
        const { values, mode } = (Array.isArray(value) ? { values: value, mode: 'is' } : value) as {
          values: string[]
          mode: 'is' | 'isnot'
        }
        if (!values || values.length === 0) return true
        const val = row.getValue(id) as string
        const matches = values.includes(val)
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
        return row.forwardPE != null && row.trailingPE != null ? ((row.forwardPE - row.trailingPE) / row.trailingPE) * 100 : 0
      },
      id: 'growth',
      header: SortingButton('Croiss. Est.', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => r.getValue('growth') as number)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer
              value={med}
              entity="%"
              background={false}
              className="m-0 p-0 text-[10px]"
            />
          </div>
        ) : null
      },
      cell: ({ row }) => (
        <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
          <VariationContainer
            value={(row.getValue('growth') as number)}
            entity="%"
            background={false}
            className="m-0 p-0 text-[11px]"
          />
        </div>
      ),

      filterFn: genericNumericFilterFn,
    },
    {
      accessorFn: (row) => row.qualityMetrics?.revenueGrowth5yAvg,
      id: 'revGrowth',
      header: SortingButton('Croissance CA (5a)', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => {
          const val = r.original.qualityMetrics?.revenueGrowth5yAvg
          return val != null ? val * 100 : null
        })
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer value={med} entity="%" background={false} className="m-0 p-0 text-[10px]" />
          </div>
        ) : null
      },
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.revenueGrowth5yAvg
        if (val == null) return <div className="font-mono tabular-nums text-right px-2 py-1 text-[11px] text-muted-foreground">N/A</div>
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
            <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0 text-[11px]" />
          </div>
        )
      },
      filterFn: genericNumericFilterFn,
    },
    {
      accessorFn: (row) => row.qualityMetrics?.roic5yAvg,
      id: 'roic',
      header: SortingButton('ROIC (5a)', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => {
          const val = r.original.qualityMetrics?.roic5yAvg
          return val != null ? val * 100 : null
        })
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs">
            <VariationContainer value={med} entity="%" background={false} className="m-0 p-0 text-[10px]" />
          </div>
        ) : null
      },
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.roic5yAvg
        if (val == null) return <div className="font-mono tabular-nums text-right px-2 py-1 text-[11px] text-muted-foreground">N/A</div>
        return (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm">
            <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0 text-[11px]" />
          </div>
        )
      },
      filterFn: genericNumericFilterFn,
    },
    {
      accessorFn: (row) => row.qualityMetrics?.pe5yAvgProxy,
      id: 'pe5y',
      header: SortingButton('PE (5a proxy)', true),
      footer: (info) => {
        const rows = info.table.getFilteredRowModel().rows
        const vals = rows.map((r) => r.original.qualityMetrics?.pe5yAvgProxy)
        const med = calculateMedian(vals)
        return med != null ? (
          <div className="font-mono tabular-nums text-right px-2 py-1 text-xs lowercase font-medium">
            {med.toFixed(1)}x
          </div>
        ) : null
      },
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.pe5yAvgProxy
        if (val == null) return <div className="font-mono tabular-nums text-right px-2 py-1 text-[11px] text-muted-foreground">N/A</div>
        return <div className="font-mono tabular-nums text-right px-2 py-1 text-xs md:text-sm lowercase font-medium">{val.toFixed(1)}x</div>
      },
      filterFn: genericNumericFilterFn,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Actions
            id=""
            symbol={row.original.symbol}
            allWatchlists={allWatchlists}
            security={row.original}
          />
        </div>
      ),
    },
  ]

  return cols
}

