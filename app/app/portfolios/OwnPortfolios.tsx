'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getAll } from '@/services/portfolioService'
import { PortfolioCard, PortfolioSummery } from './PortfolioCard'

export function OwnPortfolios({ authenticated }: { authenticated: boolean }) {
  const [portfolios, setPortfolios] = useState<PortfolioSummery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!authenticated) return
    let active = true
    setLoading(true)
    setError(false)
    getAll()
      .then((result) => {
        if (active) setPortfolios(result.ownPortfolios || [])
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
  }, [authenticated, refreshKey])

  if (!authenticated) return null

  return (
    <section aria-labelledby="own-portfolios-title" className="space-y-3">
      <h2 id="own-portfolios-title" className="text-lg font-bold">
        Mes portefeuilles
        {!loading && !error && (
          <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">
            {portfolios.length}
          </span>
        )}
      </h2>
      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4 text-sm">
          <p>Impossible de charger vos portefeuilles.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Réessayer
          </Button>
        </div>
      ) : loading ? (
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="Chargement de vos portefeuilles"
        >
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : portfolios.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} {...portfolio} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          Créez votre premier portefeuille pour suivre vos investissements. Vous
          pouvez aussi explorer les portefeuilles publics ci-dessous.
        </p>
      )}
    </section>
  )
}
