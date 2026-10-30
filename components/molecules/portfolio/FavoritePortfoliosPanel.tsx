'use client'

import Link from 'next/link'
import { ArrowRight, Bell, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { PortfolioCard, PortfolioSummery } from 'app/app/portfolios/PortfolioCard'

interface FavoritePortfoliosPanelProps {
  portfolios: PortfolioSummery[]
  loading?: boolean
  onRemoved?: (id: string) => void
}

export function FavoritePortfoliosPanel({
  portfolios,
  loading = false,
  onRemoved,
}: FavoritePortfoliosPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h2 className="flex items-center gap-2.5 text-lg font-black tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Star size={16} className="fill-current" />
            </span>
            Mes favoris
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Bell className="h-3 w-3 text-amber-500" />
            Alertes à chaque mouvement
          </p>
        </div>
        <Link href="/app/portfolios/explore" className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
          Explorer <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {loading ? (
          Array(2).fill(0).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-2xl" />)
        ) : portfolios.length > 0 ? (
          portfolios.slice(0, 4).map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              {...portfolio}
              isFavorite
              onFavoriteChange={(favorite) => {
                if (!favorite) onRemoved?.(portfolio.id)
              }}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 px-4 py-10 text-center">
            <Star className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-bold text-muted-foreground">Aucun portefeuille favori</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              Ajoutez les stratégies que vous voulez garder à portée de main et surveiller.
            </p>
            <Link href="/app/portfolios/explore" className="mt-4 text-xs font-bold text-primary hover:underline">
              Trouver un portefeuille
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
