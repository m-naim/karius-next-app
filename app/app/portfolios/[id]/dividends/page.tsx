'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import { getDividends } from '@/services/portfolioService'
import DividendsView from './dividends'
import { columns, dividendTotalFormat, type DividendRow } from './columns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import SimpleDataTable from '@/components/molecules/table/SimpleDataTable'

const yearOf = (row: DividendRow) => new Date(row.date * 1000).getUTCFullYear()

function DividendHistory({ rows, year, symbol }: {
  rows: DividendRow[]
  year: number
  symbol: string
}) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Détachements {year}{symbol && ` · ${symbol}`}</CardTitle>
      </CardHeader>
      {rows.length ? (
        <SimpleDataTable table={table} colSpan={columns.length} showFooter={false} />
      ) : (
        <CardContent className="text-sm text-muted-foreground">Aucun dividende comptabilisé sur cette année.</CardContent>
      )}
    </Card>
  )
}

function DividendBreakdown({ rows }: { rows: DividendRow[] }) {
  const [symbol, setSymbol] = useState('')
  const [year, setYear] = useState<number>()
  const [detailSymbol, setDetailSymbol] = useState('')

  const symbols = [...new Set(rows.map((row) => row.symbol))].sort()
  const years = [...new Set(rows.map(yearOf))].sort((a, b) => a - b)
  const selectedYear = year ?? years[years.length - 1]
  const byYear = new Map<number, number>()
  const bySymbol = new Map<string, number>()
  const yearRows: DividendRow[] = []

  for (const row of rows) {
    if (symbol && row.symbol !== symbol) continue
    const rowYear = yearOf(row)
    byYear.set(rowYear, (byYear.get(rowYear) ?? 0) + row.totalAmount)
    if (rowYear === selectedYear) {
      yearRows.push(row)
      bySymbol.set(row.symbol, (bySymbol.get(row.symbol) ?? 0) + row.totalAmount)
    }
  }

  const contributions = [...bySymbol].sort((a, b) => b[1] - a[1])
  const visibleRows = yearRows.filter((row) => !detailSymbol || row.symbol === detailSymbol)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="p-0 text-xl font-semibold text-foreground">Dividendes</h2>
        <div className="grid w-full gap-1.5 sm:w-56">
          <Label htmlFor="dividend-symbol">Filtrer par action</Label>
          <select id="dividend-symbol" value={symbol}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => {
              setSymbol(event.target.value)
              setDetailSymbol('')
            }}>
            <option value="">Toutes les actions</option>
            {symbols.map((ticker) => <option key={ticker}>{ticker}</option>)}
          </select>
        </div>
      </div>

      <DividendsView years={years} totals={years.map((item) => byYear.get(item) ?? 0)}
        selectedYear={selectedYear} onSelectYear={(item) => {
          setYear(item)
          setDetailSymbol('')
        }} />

      <p className="mb-0 text-xs text-muted-foreground">
        Montants comptabilisés à la date de détachement. Les totaux ne sont pas convertis entre devises.
      </p>

      {!symbol && contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total par action · {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {contributions.map(([ticker, total]) => (
                <li key={ticker}>
                  <button type="button" aria-pressed={detailSymbol === ticker}
                    onClick={() => setDetailSymbol(detailSymbol === ticker ? '' : ticker)}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted aria-pressed:bg-primary/10">
                    <span className="font-medium">{ticker}</span>
                    <span className="flex items-center gap-2 tabular-nums">
                      {dividendTotalFormat.format(total)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </span>
                  </button>
                  {detailSymbol === ticker && (
                    <div className="my-2 min-w-0">
                      <DividendHistory rows={visibleRows} year={selectedYear} symbol={ticker} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!detailSymbol && <DividendHistory rows={yearRows} year={selectedYear} symbol={symbol} />}
    </>
  )
}

export default function PageDividends() {
  const { id } = useParams<{ id: string }>()
  const [rows, setRows] = useState<DividendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let current = true
    setLoading(true)
    setError(false)
    getDividends(id).then((response) => {
      if (!current) return
      const dividends: DividendRow[] = Array.isArray(response?.dividends) ? response.dividends : []
      setRows(dividends.filter((row) =>
        typeof row?.symbol === 'string' && Number.isFinite(row.date) &&
        Number.isFinite(yearOf(row)) && Number.isFinite(row.totalAmount)
      ).sort((a, b) => b.date - a.date))
    }).catch(() => {
      if (current) setError(true)
    }).finally(() => {
      if (current) setLoading(false)
    })
    return () => { current = false }
  }, [id, retry])

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 pb-12">
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">Chargement des dividendes…</p>
      ) : error ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p role="alert" className="mb-0 text-sm">Impossible de charger les dividendes.</p>
            <Button variant="outline" size="sm" onClick={() => setRetry((attempt) => attempt + 1)}>Réessayer</Button>
          </CardContent>
        </Card>
      ) : rows.length ? (
        <DividendBreakdown key={id} rows={rows} />
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">Aucun dividende comptabilisé pour ce portefeuille.</CardContent></Card>
      )}
    </div>
  )
}
