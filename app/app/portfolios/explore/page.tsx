'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getPublicPortfolios } from '@/services/portfolioService'
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  cumulativePerformance: number
  allocation: string[]
  annualizedReturn: number
}

interface PagedResponse {
  content: PortfolioSummery[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const sortOptions = [
  { value: 'annualized_return', label: 'Performance annuelle' },
  { value: 'followers_size', label: 'Popularité' },
  { value: 'name', label: 'Nom' },
]

function AllocationChips({ allocation }: { allocation?: string[] }) {
  if (!allocation || allocation.length === 0) {
    return <span className="text-xs italic text-muted-foreground">Composition indisponible</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allocation.slice(0, 4).map((symbol) => (
        <span
          key={symbol}
          className="inline-flex items-center rounded-md border border-border/70 bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight text-muted-foreground"
        >
          {symbol}
        </span>
      ))}
      {allocation.length > 4 && (
        <span className="text-[10px] font-semibold text-muted-foreground">+{allocation.length - 4}</span>
      )}
    </div>
  )
}

function PortfolioIdentity({ portfolio }: { portfolio: PortfolioSummery }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
        <TrendingUp className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{portfolio.name}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Portefeuille public</p>
      </div>
    </div>
  )
}

function LoadingGrid() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card md:block">
        <div className="border-b border-border/70 bg-muted/30 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-3" />)}
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="grid grid-cols-5 items-center gap-4 p-4">
              <div className="col-span-2 flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-40" /></div>
              <Skeleton className="ml-auto h-7 w-16" />
              <Skeleton className="ml-auto h-7 w-20" />
              <Skeleton className="ml-auto h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="space-y-4 p-4">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-4 w-32" /></div><Skeleton className="h-7 w-16" /></div>
            <Skeleton className="h-4 w-48" />
            <div className="flex justify-between"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" /></div>
          </Card>
        ))}
      </div>
    </>
  )
}

export default function ExplorePortfoliosPage() {
  const [data, setData] = useState<PagedResponse | null>(null)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(15)
  const [sortBy, setSortBy] = useState('annualized_return')
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchPortfolios = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await getPublicPortfolios(page, limit, sortBy, direction)
      setData(response)
    } catch (requestError) {
      console.error('Error fetching public portfolios:', requestError)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolios()
  }, [page, limit, sortBy, direction])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(column)
      setDirection('DESC')
    }
    setPage(0)
  }

  const filteredContent = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return data?.content || []
    return (data?.content || []).filter((portfolio) => portfolio.name.toLowerCase().includes(query))
  }, [data, searchTerm])

  const pageNumbers = useMemo(() => {
    if (!data || data.totalPages <= 1) return []
    return Array.from(new Set([0, page - 1, page, page + 1, data.totalPages - 1]
      .filter((index) => index >= 0 && index < data.totalPages)))
  }, [data, page])

  const sortLabel = sortOptions.find((option) => option.value === sortBy)?.label || 'Performance annuelle'

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown size={12} className="ml-1 opacity-30" />
    return direction === 'ASC'
      ? <ArrowUp size={12} className="ml-1 text-primary" />
      : <ArrowDown size={12} className="ml-1 text-primary" />
  }

  return (
    <SectionContainer className="space-y-5 py-5 sm:space-y-7 sm:py-8">
      <section className="rounded-xl border border-border/70 bg-card px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Exploration communautaire
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Trouvez une stratégie à <span className="text-primary">suivre</span>
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Comparez les performances et les positions des portefeuilles publics.
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Portefeuilles</span>
              <span className="text-sm font-black tabular-nums">{data?.totalElements ?? '—'}</span>
            </div>
            <div className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tri</span>
              <span className="max-w-[12rem] truncate text-xs font-bold">{sortLabel}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Page</span>
              <span className="text-xs font-bold tabular-nums">{data ? (page + 1) + ' / ' + Math.max(data.totalPages, 1) : '—'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un portefeuille..."
              aria-label="Rechercher un portefeuille"
              className="h-10 rounded-xl border-border/70 bg-background pl-9 pr-9 text-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              Trier par
              <select
                value={sortBy}
                aria-label="Trier les portefeuilles"
                onChange={(event) => handleSort(event.target.value)}
                className="h-9 rounded-lg border border-border/70 bg-background px-2 text-xs font-bold text-foreground outline-none transition-colors hover:border-primary focus:border-primary"
              >
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              Afficher
              <select
                value={limit}
                aria-label="Nombre de portefeuilles par page"
                onChange={(event) => { setLimit(parseInt(event.target.value)); setPage(0) }}
                className="h-9 rounded-lg border border-border/70 bg-background px-2 text-xs font-bold text-foreground outline-none transition-colors hover:border-primary focus:border-primary"
              >
                <option value={15}>15 / page</option>
                <option value={30}>30 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
          <span>{filteredContent.length} résultat{filteredContent.length > 1 ? 's' : ''} sur cette page</span>
          <span className="hidden sm:inline">Cliquez sur une ligne pour ouvrir le portefeuille</span>
        </div>
      </section>

      {error ? (
        <Card className="border-rose-500/25 bg-rose-500/[0.04] p-8 text-center sm:p-12">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <h2 className="mt-3 text-base font-bold">Impossible de charger l’exploration</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Le service est momentanément indisponible. Vous pouvez réessayer sans perdre vos filtres.</p>
          <Button variant="outline" className="mt-5 rounded-xl" onClick={fetchPortfolios}>Réessayer</Button>
        </Card>
      ) : loading ? (
        <LoadingGrid />
      ) : filteredContent.length > 0 ? (
        <>
          <Card className="hidden overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/70 hover:bg-transparent">
                  <TableHead className="py-4 pl-5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    <button type="button" className="inline-flex items-center hover:text-primary" onClick={() => handleSort('name')}>
                      Portefeuille <SortIcon column="name" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    <button type="button" className="inline-flex items-center hover:text-primary" onClick={() => handleSort('followers_size')}>
                      Abonnés <SortIcon column="followers_size" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    <button type="button" className="inline-flex items-center hover:text-primary" onClick={() => handleSort('annualized_return')}>
                      Performance <SortIcon column="annualized_return" />
                    </button>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Principales positions</TableHead>
                  <TableHead className="pr-5 text-right text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Ouvrir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((portfolio) => (
                  <TableRow key={portfolio.id} className="group border-border/60 transition-colors hover:bg-primary/[0.035]">
                    <TableCell className="py-4 pl-5"><Link href={'/app/portfolios/' + portfolio.id} className="block"><PortfolioIdentity portfolio={portfolio} /></Link></TableCell>
                    <TableCell className="text-right"><span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs font-bold"><Users className="h-3.5 w-3.5 text-muted-foreground" />{portfolio.followersSize || 0}</span></TableCell>
                    <TableCell className="text-right"><VariationContainer value={portfolio.annualizedReturn} entity="%" background={true} className="m-0 inline-flex px-3 py-1 font-black text-xs" /></TableCell>
                    <TableCell><AllocationChips allocation={portfolio.allocation} /></TableCell>
                    <TableCell className="pr-5 text-right"><Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-all group-hover:bg-primary group-hover:text-primary-foreground"><Link href={'/app/portfolios/' + portfolio.id} aria-label={'Ouvrir ' + portfolio.name}><ArrowRight className="h-4 w-4" /></Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 md:hidden">
            {filteredContent.map((portfolio) => (
              <Link key={portfolio.id} href={'/app/portfolios/' + portfolio.id} className="group block">
                <Card className="overflow-hidden border-border/70 bg-card p-4 shadow-sm transition-all active:scale-[0.99] group-hover:border-primary/30 group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <PortfolioIdentity portfolio={portfolio} />
                    <VariationContainer value={portfolio.annualizedReturn} entity="%" background={true} className="m-0 shrink-0 px-2.5 py-1 font-black text-xs" />
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-muted-foreground"><Users className="h-3.5 w-3.5" />{portfolio.followersSize || 0} abonnés</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">Voir le détail <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                    </div>
                    <div className="mt-3"><AllocationChips allocation={portfolio.allocation} /></div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Card className="border-dashed border-border/80 bg-card/60 p-10 text-center sm:p-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Search className="h-5 w-5" /></div>
          <h2 className="mt-4 text-base font-bold">Aucun portefeuille trouvé</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{searchTerm ? 'Essayez un autre nom ou effacez votre recherche.' : 'Aucun portefeuille public n’est disponible pour le moment.'}</p>
          {searchTerm && <Button variant="outline" className="mt-5 rounded-xl" onClick={() => setSearchTerm('')}>Effacer la recherche</Button>}
        </Card>
      )}

      {!error && data && data.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">Page <span className="font-bold text-foreground">{page + 1}</span> sur <span className="font-bold text-foreground">{data.totalPages}</span></p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-9 rounded-xl px-3 font-bold" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0 || loading}><ChevronLeft className="mr-1 h-4 w-4" />Précédent</Button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageIndex, index) => (
                <React.Fragment key={pageIndex}>
                  {index > 0 && pageNumbers[index - 1] !== pageIndex - 1 && <span className="px-1 text-muted-foreground/50">…</span>}
                  <Button variant={page === pageIndex ? 'default' : 'ghost'} size="sm" className={cn('h-9 w-9 rounded-xl font-bold', page === pageIndex && 'shadow-md shadow-primary/20')} onClick={() => setPage(pageIndex)} disabled={loading}>{pageIndex + 1}</Button>
                </React.Fragment>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-xl px-3 font-bold" onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1 || loading}>Suivant<ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </SectionContainer>
  )
}
