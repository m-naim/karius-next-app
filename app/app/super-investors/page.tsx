'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Search,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  getSuperInvestorExplore,
  InvestorExplorePage,
} from '@/services/superInvestorService'
import { HubShell } from './components/HubShell'
import { Pager } from './components/Pager'

const sorts = [
  ['annualizedPerformance', 'Performance annualisée'],
  ['oneYearPerformance', 'Performance 1 an'],
  ['cumulativePerformance', 'Performance cumulée'],
  ['coveragePercent', 'Couverture'],
  ['totalValueUsd', 'Valeur 13F'],
  ['resolvedEquityCount', 'Nombre d’actions'],
  ['availableQuarters', 'Historique'],
  ['displayName', 'Nom'],
]

const money = (value?: number) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)

function PerformanceValue({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        value > 0 && 'text-emerald-600 dark:text-emerald-400',
        value < 0 && 'text-rose-600 dark:text-rose-400',
        value === 0 && 'text-foreground'
      )}
    >
      {value > 0 ? '+' : ''}
      {value.toFixed(2)} %
    </span>
  )
}

function Coverage({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  const partial = value < 50
  return (
    <div className="text-right">
      <span
        className={cn(
          'font-semibold tabular-nums',
          partial ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'
        )}
      >
        {value.toFixed(1)} %
      </span>
      {partial && (
        <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-3 w-3" /> partielle
        </span>
      )}
    </div>
  )
}

function LoadingTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-8 border-b bg-muted/30 px-4 py-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-3 w-24" />
        ))}
      </div>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-8 border-b px-4 py-4 last:border-0"
        >
          <Skeleton className="h-9 w-72" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <LoadingTable />
        </main>
      }
    >
      <InvestorExplore />
    </Suspense>
  )
}

function InvestorExplore() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [page, setPage] = useState(
    Math.max(0, Number(searchParams.get('page') || 1) - 1)
  )
  const [size, setSize] = useState(
    [15, 30, 50].includes(Number(searchParams.get('size')))
      ? Number(searchParams.get('size'))
      : 15
  )
  const [sort, setSort] = useState(
    searchParams.get('sort') || 'annualizedPerformance'
  )
  const [direction, setDirection] = useState<'ASC' | 'DESC'>(
    searchParams.get('direction') === 'ASC' ? 'ASC' : 'DESC'
  )
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [data, setData] = useState<InvestorExplorePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setLoading(true)
        setError(false)
        getSuperInvestorExplore({ page, size, sort, direction, query })
          .then(setData)
          .catch(() => setError(true))
          .finally(() => setLoading(false))
        const params = new URLSearchParams()
        if (page) params.set('page', String(page + 1))
        if (size !== 15) params.set('size', String(size))
        if (sort !== 'annualizedPerformance') params.set('sort', sort)
        if (direction !== 'DESC') params.set('direction', direction)
        if (query.trim()) params.set('query', query.trim())
        router.replace(`${pathname}${params.size ? `?${params}` : ''}`, {
          scroll: false,
        })
      },
      query ? 300 : 0
    )
    return () => window.clearTimeout(timer)
  }, [direction, page, pathname, query, router, size, sort])

  const changeSort = (value: string) => {
    if (value === sort)
      setDirection((current) => (current === 'ASC' ? 'DESC' : 'ASC'))
    else {
      setSort(value)
      setDirection(value === 'displayName' ? 'ASC' : 'DESC')
    }
    setPage(0)
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sort !== column)
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />
    return direction === 'ASC' ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    )
  }

  return (
    <HubShell
      total={data?.totalElements}
      coverage="Classement dès 1 %"
      latestDate={data?.content[0]?.latestReportDate}
    >
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(0)
            }}
            className="h-10 pl-9"
            placeholder="Investisseur, fonds, style ou CIK…"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(event) => changeSort(event.target.value)}
            aria-label="Trier les investisseurs"
            className="h-9 min-w-0 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
          >
            {sorts.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDirection(direction === 'ASC' ? 'DESC' : 'ASC')}
            aria-label="Inverser le tri"
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
            aria-label="Résultats par page"
            className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </section>

      {error ? (
        <ErrorState />
      ) : loading ? (
        <LoadingTable />
      ) : data?.content.length ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
              <thead className="border-b border-border bg-muted/35 text-xs text-muted-foreground">
                <tr>
                  <SortableHead
                    label="Investisseur"
                    column="displayName"
                    onSort={changeSort}
                    align="left"
                  >
                    <SortIcon column="displayName" />
                  </SortableHead>
                  <SortableHead
                    label="Perf. annualisée"
                    column="annualizedPerformance"
                    onSort={changeSort}
                  >
                    <SortIcon column="annualizedPerformance" />
                  </SortableHead>
                  <SortableHead
                    label="1 an"
                    column="oneYearPerformance"
                    onSort={changeSort}
                  >
                    <SortIcon column="oneYearPerformance" />
                  </SortableHead>
                  <SortableHead
                    label="Cumulée"
                    column="cumulativePerformance"
                    onSort={changeSort}
                  >
                    <SortIcon column="cumulativePerformance" />
                  </SortableHead>
                  <SortableHead
                    label="Couverture"
                    column="coveragePercent"
                    onSort={changeSort}
                  >
                    <SortIcon column="coveragePercent" />
                  </SortableHead>
                  <SortableHead
                    label="Actions"
                    column="resolvedEquityCount"
                    onSort={changeSort}
                  >
                    <SortIcon column="resolvedEquityCount" />
                  </SortableHead>
                  <SortableHead
                    label="Valeur 13F"
                    column="totalValueUsd"
                    onSort={changeSort}
                  >
                    <SortIcon column="totalValueUsd" />
                  </SortableHead>
                  <SortableHead
                    label="Historique"
                    column="availableQuarters"
                    onSort={changeSort}
                  >
                    <SortIcon column="availableQuarters" />
                  </SortableHead>
                  <th className="w-14 px-3 py-3">
                    <span className="sr-only">Ouvrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {data.content.map((investor, index) => (
                  <tr
                    key={investor.slug}
                    className="group transition-colors hover:bg-muted/35"
                  >
                    <td className="sticky left-0 z-[1] min-w-[320px] bg-card px-4 py-3 group-hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <span className="w-7 text-right text-xs font-semibold tabular-nums text-muted-foreground">
                          {page * size + index + 1}
                        </span>
                        <Link
                          href={`/app/super-investors/${investor.slug}`}
                          className="flex min-w-0 items-center gap-2.5 hover:text-primary"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <TrendingUp className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[210px] truncate font-bold">
                              {investor.displayName}
                            </span>
                            <span className="block max-w-[210px] truncate text-[11px] text-muted-foreground">
                              {investor.fundDisplayName} · {investor.style}
                            </span>
                          </span>
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PerformanceValue
                        value={investor.annualizedPerformance}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PerformanceValue value={investor.oneYearPerformance} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PerformanceValue
                        value={investor.cumulativePerformance}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Coverage value={investor.coveragePercent} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold tabular-nums">
                        {investor.resolvedEquityCount} /{' '}
                        {investor.totalPositionCount}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        résolues / lignes
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {money(investor.totalValueUsd)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold tabular-nums">
                        {investor.availableQuarters}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        trimestres
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Link
                          href={`/app/super-investors/${investor.slug}`}
                          aria-label={`Ouvrir ${investor.displayName}`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      ) : (
        <Card className="border-dashed p-12 text-center">
          <Search className="mx-auto h-6 w-6 text-muted-foreground" />
          <h2 className="mt-3 font-bold">Aucun investisseur trouvé</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez un autre nom, fonds, style ou CIK.
          </p>
        </Card>
      )}
    </HubShell>
  )
}

function SortableHead({
  label,
  column,
  onSort,
  children,
  align = 'right',
}: {
  label: string
  column: string
  onSort: (column: string) => void
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 font-semibold',
        align === 'right'
          ? 'text-right'
          : 'sticky left-0 z-10 min-w-[320px] bg-muted text-left'
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center hover:text-foreground',
          align === 'right' && 'ml-auto'
        )}
      >
        {label}
        {children}
      </button>
    </th>
  )
}

function ErrorState() {
  return (
    <Card className="border-rose-500/25 p-10 text-center">
      <h2 className="font-bold">Impossible de charger le classement</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Le service est momentanément indisponible.
      </p>
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => location.reload()}
      >
        Réessayer
      </Button>
    </Card>
  )
}
