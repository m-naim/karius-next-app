'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ConsensusReport,
  ConsensusStock,
  getConsensusReport,
} from '@/services/superInvestorService'
import { HubShell } from './HubShell'
import { Pager } from './Pager'

export type ConsensusView = 'mostOwned' | 'topBuys' | 'topSells'
type Sort = 'investors' | 'value' | 'weight' | 'change'

const config = {
  mostOwned: {
    title: 'Actions les plus détenues',
    description: 'Les titres présents chez le plus grand nombre de déclarants.',
    defaultSort: 'investors' as Sort,
  },
  topBuys: {
    title: 'Principaux renforcements',
    description:
      'Les titres achetés ou renforcés par le plus grand nombre de déclarants.',
    defaultSort: 'investors' as Sort,
  },
  topSells: {
    title: 'Principaux allègements',
    description:
      'Les titres réduits ou clôturés par le plus grand nombre de déclarants.',
    defaultSort: 'investors' as Sort,
  },
}

const money = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

function averageChange(stock: ConsensusStock, view: ConsensusView) {
  const types = view === 'topBuys' ? ['NEW', 'ADDED'] : ['REDUCED', 'CLOSED']
  const values = stock.holders
    .filter(
      (holder) =>
        types.includes(holder.changeType) && holder.changePercent != null
    )
    .map((holder) => Math.abs(holder.changePercent!))
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0
}

export function ConsensusExplore({ view }: { view: ConsensusView }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [report, setReport] = useState<ConsensusReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [sort, setSort] = useState<Sort>(
    (searchParams.get('sort') as Sort) || config[view].defaultSort
  )
  const [direction, setDirection] = useState<'ASC' | 'DESC'>(
    searchParams.get('direction') === 'ASC' ? 'ASC' : 'DESC'
  )
  const [size, setSize] = useState(
    [15, 30, 50].includes(Number(searchParams.get('size')))
      ? Number(searchParams.get('size'))
      : 15
  )
  const [page, setPage] = useState(
    Math.max(0, Number(searchParams.get('page') || 1) - 1)
  )

  useEffect(() => {
    getConsensusReport()
      .then(setReport)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (sort !== config[view].defaultSort) params.set('sort', sort)
    if (direction !== 'DESC') params.set('direction', direction)
    if (size !== 15) params.set('size', String(size))
    if (page) params.set('page', String(page + 1))
    router.replace(`${pathname}${params.size ? `?${params}` : ''}`, {
      scroll: false,
    })
  }, [direction, page, pathname, query, router, size, sort, view])

  const rows = useMemo(() => {
    const source = report?.[view] || []
    const needle = query.trim().toLocaleLowerCase('fr')
    const filtered = needle
      ? source.filter((stock) =>
          [
            stock.symbol,
            stock.issuerName,
            ...stock.holders.map((holder) => holder.investorName),
          ].some((value) => value.toLocaleLowerCase('fr').includes(needle))
        )
      : source
    const count = (stock: ConsensusStock) =>
      view === 'mostOwned'
        ? stock.investorCount
        : view === 'topBuys'
        ? stock.buyCount
        : stock.sellCount
    return [...filtered].sort((a, b) => {
      const aValue =
        sort === 'investors'
          ? count(a)
          : sort === 'value'
          ? a.totalValueUsd
          : sort === 'weight'
          ? a.averageWeightPercent
          : averageChange(a, view)
      const bValue =
        sort === 'investors'
          ? count(b)
          : sort === 'value'
          ? b.totalValueUsd
          : sort === 'weight'
          ? b.averageWeightPercent
          : averageChange(b, view)
      return (aValue - bValue) * (direction === 'ASC' ? 1 : -1)
    })
  }, [direction, query, report, sort, view])

  const totalPages = Math.ceil(rows.length / size)
  const visibleRows = rows.slice(page * size, page * size + size)
  const count = (stock: ConsensusStock) =>
    view === 'mostOwned'
      ? stock.investorCount
      : view === 'topBuys'
      ? stock.buyCount
      : stock.sellCount

  return (
    <HubShell
      total={report?.totalInvestorsAnalyzed}
      coverage={report?.coverageLabel}
      latestDate={report?.latestReportDate}
    >
      <div>
        <h2 className="text-xl font-black">{config[view].title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {config[view].description}
        </p>
      </div>
      <section className="rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(0)
              }}
              placeholder="Ticker, société ou investisseur…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as Sort)
                setPage(0)
              }}
              className="h-9 rounded-lg border bg-background px-2 text-xs font-bold"
            >
              <option value="investors">Nombre d’investisseurs</option>
              <option value="value">Valeur totale</option>
              <option value="weight">Poids moyen</option>
              {view !== 'mostOwned' && (
                <option value="change">Variation moyenne</option>
              )}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDirection(direction === 'ASC' ? 'DESC' : 'ASC')}
            >
              {direction === 'ASC' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
            <select
              value={size}
              onChange={(event) => {
                setSize(Number(event.target.value))
                setPage(0)
              }}
              className="h-9 rounded-lg border bg-background px-2 text-xs font-bold"
            >
              <option value={15}>15 / page</option>
              <option value={30}>30 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          {rows.length} titre{rows.length === 1 ? '' : 's'}
        </p>
      </section>

      {error ? (
        <Card className="p-10 text-center font-bold">
          Consensus momentanément indisponible.
        </Card>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-20" />
          ))}
        </div>
      ) : visibleRows.length ? (
        <>
          <Card className="overflow-hidden rounded-2xl">
            <div className="hidden grid-cols-[minmax(190px,1fr)_110px_120px_140px_minmax(260px,1.5fr)] gap-3 border-b bg-muted/30 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground md:grid">
              <span>Titre</span>
              <span className="text-right">Déclarants</span>
              <span className="text-right">Poids moyen</span>
              <span className="text-right">Valeur</span>
              <span>Investisseurs</span>
            </div>
            <div className="divide-y">
              {visibleRows.map((stock) => (
                <div
                  key={stock.symbol}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(190px,1fr)_110px_120px_140px_minmax(260px,1.5fr)] md:items-center md:px-5"
                >
                  <div>
                    <p className="font-black">{stock.symbol}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {stock.issuerName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:block md:text-right">
                    <span className="text-xs text-muted-foreground md:hidden">
                      Déclarants
                    </span>
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      {count(stock)}
                    </Badge>
                  </div>
                  <p className="flex justify-between text-sm font-bold md:block md:text-right">
                    <span className="text-xs font-normal text-muted-foreground md:hidden">
                      Poids moyen
                    </span>
                    {stock.averageWeightPercent.toFixed(2)} %
                  </p>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {money(stock.totalValueUsd)}
                    </p>
                    {view !== 'mostOwned' && (
                      <p className="text-[11px] text-muted-foreground">
                        Variation moy. {averageChange(stock, view).toFixed(1)} %
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {stock.holders.slice(0, 5).map((holder) => (
                      <Link
                        key={holder.investorSlug}
                        href={`/app/super-investors/${holder.investorSlug}`}
                        className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold hover:bg-accent"
                      >
                        {holder.investorName}
                      </Link>
                    ))}
                    {stock.holders.length > 5 && (
                      <Badge variant="outline">
                        +{stock.holders.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Pager page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : (
        <Card className="border-dashed p-12 text-center">
          <Search className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-3 font-bold">Aucun titre trouvé</h3>
        </Card>
      )}
    </HubShell>
  )
}
