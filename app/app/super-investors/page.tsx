'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Search,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getSuperInvestorExplore,
  InvestorExploreItem,
  InvestorExplorePage,
} from '@/services/superInvestorService'
import { HubShell } from './components/HubShell'
import { Pager } from './components/Pager'

const sorts = [
  ['annualizedPerformance', 'Performance annualisée'],
  ['oneYearPerformance', 'Performance 1 an'],
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
const percent = (value?: number | null) =>
  value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)} %`

function Performance({ investor }: { investor: InvestorExploreItem }) {
  const value = investor.annualizedPerformance
  return (
    <div className="text-right">
      <p
        className={
          value == null
            ? 'font-bold text-muted-foreground'
            : value >= 0
            ? 'font-black tabular-nums text-emerald-600'
            : 'font-black tabular-nums text-rose-600'
        }
      >
        {percent(value)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        1 an {percent(investor.oneYearPerformance)}
      </p>
      {value == null && investor.cumulativePerformance != null && (
        <p className="text-[11px] text-muted-foreground">
          Cumul {percent(investor.cumulativePerformance)}
        </p>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          <LoadingRows />
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

  return (
    <HubShell
      total={data?.totalElements}
      coverage="Classement dès 1 %"
      latestDate={data?.content[0]?.latestReportDate}
    >
      <section className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
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
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Trier par{' '}
              <select
                value={sort}
                onChange={(event) => changeSort(event.target.value)}
                className="ml-1 h-9 rounded-lg border bg-background px-2 font-bold text-foreground"
              >
                {sorts.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              size="sm"
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
              className="h-9 rounded-lg border bg-background px-2 text-xs font-bold"
            >
              <option value={15}>15 / page</option>
              <option value={30}>30 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          {data?.totalElements ?? 0} investisseur
          {data?.totalElements === 1 ? '' : 's'} · la couverture qualifie chaque
          performance.
        </p>
      </section>

      {error ? (
        <ErrorState />
      ) : loading ? (
        <LoadingRows />
      ) : data?.content.length ? (
        <>
          <Card className="hidden overflow-hidden rounded-2xl border-border/70 md:block">
            <div className="grid grid-cols-[minmax(230px,1.5fr)_140px_130px_125px_110px_40px] gap-3 border-b bg-muted/30 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <span>Investisseur</span>
              <span className="text-right">Performance</span>
              <span className="text-right">Actions résolues</span>
              <span className="text-right">Valeur 13F</span>
              <span className="text-right">Couverture</span>
              <span />
            </div>
            <div className="divide-y">
              {data.content.map((investor) => (
                <InvestorRow key={investor.slug} investor={investor} />
              ))}
            </div>
          </Card>
          <div className="space-y-3 md:hidden">
            {data.content.map((investor) => (
              <InvestorCard key={investor.slug} investor={investor} />
            ))}
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

function InvestorRow({ investor }: { investor: InvestorExploreItem }) {
  return (
    <Link
      href={`/app/super-investors/${investor.slug}`}
      className="group grid grid-cols-[minmax(230px,1.5fr)_140px_130px_125px_110px_40px] items-center gap-3 px-5 py-4 hover:bg-primary/[0.035]"
    >
      <Identity investor={investor} />
      <Performance investor={investor} />
      <div className="text-right">
        <p className="font-bold tabular-nums">
          {investor.resolvedEquityCount} / {investor.totalPositionCount}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {investor.availableQuarters} trimestres
        </p>
      </div>
      <p className="text-right text-sm font-bold tabular-nums">
        {money(investor.totalValueUsd)}
      </p>
      <Coverage value={investor.coveragePercent} />
      <ArrowRight className="h-4 w-4 justify-self-end text-muted-foreground group-hover:text-primary" />
    </Link>
  )
}

function InvestorCard({ investor }: { investor: InvestorExploreItem }) {
  return (
    <Link href={`/app/super-investors/${investor.slug}`}>
      <Card className="p-4 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <Identity investor={investor} />
          <Performance investor={investor} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-xs">
          <div>
            <p className="text-muted-foreground">Actions</p>
            <p className="font-bold">
              {investor.resolvedEquityCount}/{investor.totalPositionCount}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Valeur</p>
            <p className="font-bold">{money(investor.totalValueUsd)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Couverture</p>
            <Coverage value={investor.coveragePercent} />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function Identity({ investor }: { investor: InvestorExploreItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <TrendingUp className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{investor.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {investor.fundDisplayName} · {investor.style}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          CIK {investor.cik}
        </p>
      </div>
    </div>
  )
}

function Coverage({ value }: { value?: number | null }) {
  const low = value != null && value < 50
  return (
    <div className="text-right">
      <Badge
        variant="outline"
        className={
          low
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
        }
      >
        {value == null ? '—' : `${value.toFixed(1)} %`}
      </Badge>
      {low && (
        <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-amber-700">
          <ShieldAlert className="h-3 w-3" />
          partielle
        </p>
      )}
    </div>
  )
}
function LoadingRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-xl" />
      ))}
    </div>
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
