'use client'

import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bell, BookOpen, ListTodo, Users } from 'lucide-react'
import { AuthContext } from 'hooks/authContext'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UpcomingEarnings } from '@/components/earnings/UpcomingEarnings'
import { getAll as getPortfolios } from '@/services/portfolioService'
import {
  DashboardMovers,
  getDashboardMovers,
} from '@/services/dashboardService'
import { cn } from '@/lib/utils'

interface DailyPortfolio {
  id: string
  name: string
  dayChangePercent: number | string | null
}

const loadPortfolios = async (
  signal: AbortSignal
): Promise<DailyPortfolio[]> => {
  const response = await getPortfolios({ signal })
  return response.ownPortfolios || []
}

function useDashboardResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  enabled: boolean
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setData(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    load(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [load, enabled, version])

  return {
    data,
    loading,
    error,
    retry: () => setVersion((current) => current + 1),
  }
}

const loadMovers = (signal: AbortSignal) => getDashboardMovers({ signal })

function Change({
  value,
  highlight = false,
}: {
  value: number | string | null | undefined
  highlight?: boolean
}) {
  const number = value == null || value === '' ? NaN : Number(value)
  if (!Number.isFinite(number))
    return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        'whitespace-nowrap tabular-nums',
        number > 0 && 'text-emerald-700 dark:text-emerald-400',
        number < 0 && 'text-rose-700 dark:text-rose-400',
        highlight && Math.abs(number) > 5 ? 'font-extrabold' : 'font-medium'
      )}
    >
      {number > 0 ? '+' : ''}
      {number.toFixed(2)} %
    </span>
  )
}

function LoadError({ retry }: { retry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <p className="m-0 text-muted-foreground">Chargement impossible.</p>
      <Button variant="outline" size="sm" onClick={retry}>
        Réessayer
      </Button>
    </div>
  )
}

function RowsSkeleton() {
  return (
    <div className="space-y-2 py-2" aria-label="Chargement en cours">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-10 rounded-md" />
      ))}
    </div>
  )
}

function Movers({ data }: { data: DashboardMovers }) {
  return (
    <>
      {data.movers.length ? (
        <table className="w-full table-fixed text-xs sm:text-sm">
          <caption className="sr-only">
            Variations des actions de vos portefeuilles et watchlists dépassant
            5 % en valeur absolue sur au moins une période.
          </caption>
          <thead className="border-b border-border text-[11px] text-muted-foreground">
            <tr>
              <th scope="col" className="w-[42%] py-2 text-left font-medium">
                Action
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                1 j
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                1 sem.
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                1 mois
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.movers.map((stock) => {
              const portfolio = stock.contexts.some(
                (context) => context.type === 'PORTFOLIO'
              )
              const watchlist = stock.contexts.some(
                (context) => context.type === 'WATCHLIST'
              )
              return (
                <tr key={stock.symbol}>
                  <th
                    scope="row"
                    className="min-w-0 py-2.5 pr-2 text-left font-normal"
                  >
                    <Link
                      href={`/app/stocks/${encodeURIComponent(stock.symbol)}`}
                      className="block truncate font-bold hover:text-primary"
                      title={stock.name}
                    >
                      {stock.symbol}
                      <span className="ml-2 hidden font-normal text-muted-foreground sm:inline">
                        {stock.name}
                      </span>
                    </Link>
                    <span
                      className="mt-0.5 block text-[10px] text-muted-foreground"
                      title={stock.contexts
                        .map((context) => context.name)
                        .join(', ')}
                    >
                      {portfolio && watchlist
                        ? 'Portefeuille · Watchlist'
                        : portfolio
                        ? 'Portefeuille'
                        : 'Watchlist'}
                    </span>
                  </th>
                  <td className="py-2.5 text-right">
                    <Change value={stock.dayChangePercent} highlight />
                  </td>
                  <td className="py-2.5 text-right">
                    <Change value={stock.weekChangePercent} highlight />
                  </td>
                  <td className="py-2.5 text-right">
                    <Change value={stock.monthChangePercent} highlight />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p className="my-3 text-sm text-muted-foreground">
          {data.trackedCount === 0
            ? 'Ajoutez des actions à un portefeuille ou une watchlist pour retrouver leurs mouvements ici.'
            : 'Aucun mouvement supérieur à ±5 % sur les périodes disponibles.'}
        </p>
      )}
      {data.incompleteCount > 0 && (
        <p className="mb-0 mt-2 text-xs text-muted-foreground">
          Certaines variations sont indisponibles pour {data.incompleteCount}{' '}
          action{data.incompleteCount > 1 ? 's' : ''}.
        </p>
      )}
    </>
  )
}

export default function AppDashboard() {
  const { user } = useContext(AuthContext)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const portfolios = useDashboardResource(loadPortfolios, Boolean(user))
  const movers = useDashboardResource(loadMovers, Boolean(user))

  return (
    <SectionContainer className="max-w-4xl space-y-5 py-4 sm:py-6 xl:max-w-4xl">
      <h1 className="m-0 p-0 text-xl font-bold tracking-tight text-foreground">
        Aujourd’hui
      </h1>
      {!mounted ? (
        <RowsSkeleton />
      ) : !user ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="m-0 text-sm text-muted-foreground">
            Connectez-vous pour retrouver vos portefeuilles, les mouvements de
            vos actions et vos prochaines publications.
          </p>
          <Button asChild>
            <Link href="/login?redirect=/app">Se connecter</Link>
          </Button>
        </div>
      ) : (
        <>
          <section aria-labelledby="daily-portfolios">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2
                id="daily-portfolios"
                className="m-0 p-0 text-base font-bold text-foreground"
              >
                Mes portefeuilles · 1 j
              </h2>
              <Link
                href="/app/portfolios"
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Tous <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </div>
            {portfolios.error ? (
              <LoadError retry={portfolios.retry} />
            ) : portfolios.loading ? (
              <RowsSkeleton />
            ) : portfolios.data?.length ? (
              <div className="divide-y divide-border/60 border-y border-border/70">
                {portfolios.data.map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    href={`/app/portfolios/${portfolio.id}`}
                    className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate font-semibold">
                      {portfolio.name}
                    </span>
                    <Change value={portfolio.dayChangePercent} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="my-3 text-sm text-muted-foreground">
                Aucun portefeuille.{' '}
                <Link
                  href="/app/portfolios/new"
                  className="font-semibold text-primary hover:underline"
                >
                  Créer mon premier portefeuille
                </Link>
              </p>
            )}
          </section>

          <section aria-labelledby="tracked-movers">
            <h2
              id="tracked-movers"
              className="m-0 p-0 text-base font-bold text-foreground"
            >
              Ce qui bouge
            </h2>
            <p className="mb-2 mt-1 text-xs text-muted-foreground">
              Portefeuilles et watchlists · hausses et baisses de plus de 5 %
            </p>
            {movers.error ? (
              <LoadError retry={movers.retry} />
            ) : movers.loading ? (
              <RowsSkeleton />
            ) : (
              movers.data && <Movers data={movers.data} />
            )}
          </section>

          <UpcomingEarnings />
        </>
      )}

      <nav
        aria-label="Autres outils"
        className="flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-4 text-xs font-semibold text-muted-foreground"
      >
        {[
          { href: '/app/watchlist', label: 'Mes watchlists', Icon: ListTodo },
          { href: '/app/alerts', label: 'Mes alertes', Icon: Bell },
          {
            href: '/app/super-investors',
            label: 'Super Investors',
            Icon: Users,
          },
          { href: '/fr/guide', label: 'Guides', Icon: BookOpen },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    </SectionContainer>
  )
}
