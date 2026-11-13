'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from 'hooks/authContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ExploreTable } from '@/components/molecules/table/ExploreTable'
import { DataFreshness } from '@/components/molecules/DataFreshness'
import { FreshnessInfo } from '@/lib/data-freshness'
import { OwnPortfolios } from './OwnPortfolios'
import { follow, getPublicPortfolios } from '@/services/portfolioService'

interface PortfolioSummary {
  performanceFreshness?: FreshnessInfo
  id: string
  name: string
  followersSize: number
  dayChangePercent: number | string | null
  cumulativePerformance: number | string | null
  allocation: string[]
  annualizedReturn: number | null
  followed: boolean
  own: boolean
}

interface PagedResponse {
  content: PortfolioSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const sortOptions = [
  { value: 'annualized_return', label: 'Performance annualisée' },
  { value: 'day_change_percent', label: 'Variation 24 h' },
  { value: 'cumulative_performance', label: 'Performance cumulée' },
  { value: 'followers_size', label: 'Plus suivis' },
  { value: 'name', label: 'Nom' },
]

const numeric = (value: number | string | null | undefined) => {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function PerformanceValue({
  value,
  muted = false,
}: {
  value: number | string | null
  muted?: boolean
}) {
  const parsed = numeric(value)
  if (parsed == null) return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        !muted && parsed > 0 && 'text-emerald-600 dark:text-emerald-400',
        !muted && parsed < 0 && 'text-rose-600 dark:text-rose-400',
        (muted || parsed === 0) && 'text-foreground'
      )}
    >
      {parsed > 0 ? '+' : ''}
      {parsed.toFixed(2)} %
    </span>
  )
}

function Allocation({ allocation }: { allocation?: string[] }) {
  if (!allocation?.length)
    return <span className="text-xs text-muted-foreground">Non renseignée</span>
  return (
    <div className="flex max-w-full items-center gap-1.5" title={allocation.join(', ')}>
      {allocation.slice(0, 3).map((symbol) => (
        <span
          key={symbol}
          className="hidden rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold uppercase md:inline"
        >
          {symbol}
        </span>
      ))}
      <span className="truncate text-[10px] font-bold md:hidden">{allocation[0]}</span>
      {allocation.length > 1 && (
        <span className="shrink-0 text-[10px] text-muted-foreground md:hidden">
          +{allocation.length - 1}
        </span>
      )}
      {allocation.length > 3 && (
        <span className="hidden text-[10px] font-semibold text-muted-foreground md:inline">
          +{allocation.length - 3}
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
          <Skeleton className="h-9 w-64" />
          <Skeleton className="ml-auto h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function PortfoliosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [data, setData] = useState<PagedResponse | null>(null)
  const { user } = useContext(AuthContext)
  const authenticated = Boolean(user)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(15)
  const [sortBy, setSortBy] = useState('annualized_return')
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(
    new Set()
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!authenticated) {
      setFavoritesOnly(false)
      setPage(0)
    }
  }, [authenticated])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    getPublicPortfolios(page, limit, sortBy, direction, favoritesOnly)
      .then((result: PagedResponse) => {
        if (!active) return
        // Removing the final favorite on a page can reduce the page count.
        if (page > 0 && page >= result.totalPages) {
          setPage(Math.max(0, result.totalPages - 1))
          return
        }
        setData(result)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, limit, sortBy, direction, favoritesOnly, refreshKey])

  const handleSort = (column: string) => {
    if (sortBy === column)
      setDirection((current) => (current === 'ASC' ? 'DESC' : 'ASC'))
    else {
      setSortBy(column)
      setDirection(column === 'name' ? 'ASC' : 'DESC')
    }
    setPage(0)
  }

  const updatePortfolio = (
    id: string,
    update: (portfolio: PortfolioSummary) => PortfolioSummary
  ) => {
    setData((current) =>
      current
        ? {
            ...current,
            content: current.content.map((portfolio) =>
              portfolio.id === id ? update(portfolio) : portfolio
            ),
          }
        : current
    )
  }

  const toggleFavorite = async (portfolio: PortfolioSummary) => {
    if (portfolio.own || pendingFavorites.has(portfolio.id)) return
    if (!localStorage.getItem('accessToken')) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    const nextFollowed = !portfolio.followed
    setPendingFavorites((current) => new Set(current).add(portfolio.id))
    updatePortfolio(portfolio.id, (item) => ({
      ...item,
      followed: nextFollowed,
      followersSize: Math.max(0, item.followersSize + (nextFollowed ? 1 : -1)),
    }))

    try {
      const result = await follow(portfolio.id)
      updatePortfolio(portfolio.id, (item) => ({
        ...item,
        followed: Boolean(result.followed),
        followersSize: Number(result.followersSize),
      }))
      setRefreshKey((current) => current + 1)
    } catch {
      updatePortfolio(portfolio.id, () => portfolio)
      toast({
        variant: 'destructive',
        title: 'Favori non modifié',
        description: 'Le portefeuille n’a pas pu être ajouté à vos favoris.',
      })
    } finally {
      setPendingFavorites((current) => {
        const next = new Set(current)
        next.delete(portfolio.id)
        return next
      })
    }
  }

  const filteredContent = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fr')
    if (!query) return data?.content || []
    return (data?.content || []).filter((portfolio) =>
      [portfolio.name, ...(portfolio.allocation || [])].some((value) =>
        value.toLocaleLowerCase('fr').includes(query)
      )
    )
  }, [data, searchTerm])

  const pageNumbers = useMemo(() => {
    if (!data || data.totalPages <= 1) return []
    return Array.from(
      new Set(
        [0, page - 1, page, page + 1, data.totalPages - 1].filter(
          (index) => index >= 0 && index < data.totalPages
        )
      )
    )
  }, [data, page])

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column)
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />
    return direction === 'ASC' ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    )
  }

  return (
    <SectionContainer className="space-y-5 py-5 sm:py-8">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Portefeuilles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Retrouvez vos investissements et découvrez d’autres stratégies.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <Link href="/app/portfolios/new">
            <Plus className="h-4 w-4" />
            Créer un portefeuille
          </Link>
        </Button>
      </header>

      <OwnPortfolios authenticated={authenticated} />

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-bold">Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparez les portefeuilles publics et suivez vos favoris.
          </p>
        </div>
        {!loading && !error && data && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {data.totalElements}{' '}
            {favoritesOnly
              ? data.totalElements > 1
                ? 'favoris'
                : 'favori'
              : data.totalElements > 1
              ? 'portefeuilles publics'
              : 'portefeuille public'}
          </span>
        )}
      </div>

      <div
        className="flex gap-2"
        role="group"
        aria-label="Afficher les portefeuilles"
      >
        {[
          { value: false, label: 'Tous' },
          ...(authenticated ? [{ value: true, label: 'Mes favoris' }] : []),
        ].map(({ value, label }) => (
          <Button
            key={label}
            variant={favoritesOnly === value ? 'default' : 'outline'}
            size="sm"
            aria-pressed={favoritesOnly === value}
            onClick={() => {
              setFavoritesOnly(value)
              setPage(0)
            }}
            className="gap-1.5"
          >
            {value && <Star className="h-3.5 w-3.5" />}
            {label}
          </Button>
        ))}
      </div>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un portefeuille ou un ticker…"
            aria-label="Rechercher dans la page de portefeuilles"
            className="h-10 pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(event) => handleSort(event.target.value)}
            aria-label="Trier les portefeuilles"
            className="h-11 min-w-0 flex-1 sm:h-9 sm:flex-none rounded-lg border border-border bg-background px-2 text-xs font-semibold"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
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
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value))
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
        <Card className="border-rose-500/30 p-10 text-center">
          <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
          <h2 className="mt-3 font-bold">
            Impossible de charger l’exploration
          </h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Réessayer
          </Button>
        </Card>
      ) : loading ? (
        <LoadingTable />
      ) : filteredContent.length ? (
        <ExploreTable metricCount={6} label="Portefeuilles publics">
          <thead className="border-b border-border bg-muted/35 text-xs text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-10 md:min-w-[280px] bg-muted px-4 py-3 text-left font-semibold">
                Portefeuille
              </th>
              <SortableHead
                label="Perf. annualisée"
                column="annualized_return"
                onSort={handleSort}
              >
                <SortIcon column="annualized_return" />
              </SortableHead>
              <SortableHead
                label="24 h"
                column="day_change_percent"
                onSort={handleSort}
              >
                <SortIcon column="day_change_percent" />
              </SortableHead>
              <SortableHead
                label="Cumulée"
                column="cumulative_performance"
                onSort={handleSort}
              >
                <SortIcon column="cumulative_performance" />
              </SortableHead>
              <SortableHead
                label="Abonnés"
                column="followers_size"
                onSort={handleSort}
              >
                <SortIcon column="followers_size" />
              </SortableHead>
              <th className="md:min-w-[190px] px-4 py-3 text-left font-semibold">
                Principales positions
              </th>
              <th className="w-14 px-3 py-3">
                <span className="sr-only">Ouvrir</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filteredContent.map((portfolio, index) => (
              <tr
                key={portfolio.id}
                className="group transition-colors hover:bg-muted/35"
              >
                <td className="sticky left-0 z-[1] bg-card px-4 py-3 group-hover:bg-muted">
                  <div className="flex min-w-0 items-center gap-1 md:gap-2.5">
                    <span className="hidden w-7 shrink-0 md:block text-right text-xs font-semibold tabular-nums text-muted-foreground">
                      {page * limit + index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={
                        portfolio.own || pendingFavorites.has(portfolio.id)
                      }
                      onClick={() => toggleFavorite(portfolio)}
                      title={
                        portfolio.own
                          ? 'Votre portefeuille'
                          : portfolio.followed
                          ? 'Retirer des favoris'
                          : 'Ajouter aux favoris'
                      }
                      aria-label={
                        portfolio.followed
                          ? `Retirer ${portfolio.name} des favoris`
                          : `Ajouter ${portfolio.name} aux favoris`
                      }
                      aria-pressed={portfolio.followed}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Star
                        className="h-4 w-4"
                        fill={portfolio.followed ? 'currentColor' : 'none'}
                      />
                    </button>
                    <Link
                      href={`/app/portfolios/${portfolio.id}`}
                      className="flex min-w-0 flex-1 items-center gap-1 md:gap-2.5 font-bold hover:text-primary"
                    >
                      <span className="hidden h-8 w-8 shrink-0 md:flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 truncate md:max-w-[175px]">
                        {portfolio.name}
                      </span>
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <PerformanceValue value={portfolio.annualizedReturn} />
                </td>
                <td className="px-4 py-3 text-right">
                  <PerformanceValue value={portfolio.dayChangePercent} />
                </td>
                <td className="px-4 py-3 text-right">
                  <PerformanceValue value={portfolio.cumulativePerformance} />
                  <DataFreshness info={portfolio.performanceFreshness} calculation className="ml-auto" />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1.5 font-semibold tabular-nums">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {portfolio.followersSize || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Allocation allocation={portfolio.allocation} />
                </td>
                <td className="px-3 py-3 text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Link
                      href={`/app/portfolios/${portfolio.id}`}
                      aria-label={`Ouvrir ${portfolio.name}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </ExploreTable>
      ) : (
        <Card className="border-dashed p-12 text-center">
          <Search className="mx-auto h-6 w-6 text-muted-foreground" />
          <h3 className="mt-3 font-bold">
            {favoritesOnly && !searchTerm
              ? 'Aucun favori pour le moment'
              : 'Aucun portefeuille trouvé'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {favoritesOnly && !searchTerm
              ? 'Dans Tous, cliquez sur l’étoile d’un portefeuille pour le retrouver ici.'
              : 'Essayez un autre nom ou ticker.'}
          </p>
        </Card>
      )}

      {!error && data && data.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{page + 1}</strong> sur{' '}
            <strong className="text-foreground">{data.totalPages}</strong>
          </p>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            {pageNumbers.map((pageIndex, index) => (
              <React.Fragment key={pageIndex}>
                {index > 0 && pageNumbers[index - 1] !== pageIndex - 1 && (
                  <span className="px-1 text-muted-foreground">…</span>
                )}
                <Button
                  variant={page === pageIndex ? 'default' : 'ghost'}
                  size="sm"
                  className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
                  onClick={() => setPage(pageIndex)}
                >
                  {pageIndex + 1}
                </Button>
              </React.Fragment>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
              disabled={page >= data.totalPages - 1 || loading}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </SectionContainer>
  )
}

function SortableHead({
  label,
  column,
  onSort,
  children,
}: {
  label: string
  column: string
  onSort: (column: string) => void
  children: React.ReactNode
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">
      <button
        type="button"
        aria-label={`Trier par ${label}`}
        onClick={() => onSort(column)}
        className="ml-auto inline-flex items-center hover:text-foreground"
      >
        <span className="md:hidden">
          {column === 'annualized_return' ? 'Perf. / an' : label}
        </span>
        <span className="hidden md:inline">{label}</span>
        {children}
      </button>
    </th>
  )
}
