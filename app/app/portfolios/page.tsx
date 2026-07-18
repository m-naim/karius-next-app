'use client'

import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import authService from '@/services/authService'
import { getAll } from '@/services/portfolioService'
import { Flame, Star, StarIcon, TrendingUp, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { PortfolioCard, PortfolioSummery } from './PortfolioCard'

interface PortfoliosPresentation {
  ownPortfolios: PortfolioSummery[]
  bestPerformingPortfolios: PortfolioSummery[]
  mostFollowedPortfolios: PortfolioSummery[]
}

const Portfolios = () => {
  const [mounted, setMounted] = React.useState(false)
  const [data, setData] = React.useState<PortfoliosPresentation>()

  const { authentificated } = authService.getCurrentUser()

  const fetchData = async () => {
    try {
      const res = await getAll()
      setData(res)
    } catch (e) {
      console.error('error api:', e)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-16 py-8">
      {authentificated && (
        <SectionContainer className="space-y-8">
            <div className="flex w-full flex-col items-center px-4 text-center">
            <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
              Mes Portefeuilles
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Gérez vos actifs, analysez vos performances et optimisez votre stratégie.
            </p>
            <div className="mt-6">
              <Button asChild data-umami-event="portfolios-new-button" size={'sm'} className="rounded-full px-6">
                <Link data-umami-event="portfolios-new-button" href={'portfolios/new'}>
                  + Créer un portefeuille
                </Link>
              </Button>
            </div>
          </div>

          <PortfoliosSection items={data?.ownPortfolios} />
        </SectionContainer>
      )}

      <SectionContainer className="space-y-10">
        <div className="flex w-full flex-col items-center px-4 text-center">
          <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Inspiration Communautaire
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Découvrez comment les autres investisseurs structurent leurs portefeuilles.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="border-border bg-card/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-6 pb-4 pt-6">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <Flame className="h-4.5 w-4.5" fill="currentColor" />
                </div>
                Les plus performants
              </CardTitle>
              <Link
                href="/app/portfolios/explore"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-2 pb-6">
              <PortfoliosSuggestSection items={data?.bestPerformingPortfolios} />
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-6 pb-4 pt-6">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                  <StarIcon className="h-4.5 w-4.5" fill="currentColor" />
                </div>
                Les plus suivis
              </CardTitle>
              <Link
                href="/app/portfolios/explore"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-2 pb-6">
              <PortfoliosSuggestSection items={data?.mostFollowedPortfolios} />
            </CardContent>
          </Card>
        </div>
      </SectionContainer>
    </div>
  )
}

export default Portfolios

function PortfoliosSection({ items }) {
  if (!items?.length) return null
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((w) => (
        <PortfolioCard key={w.id} {...w} />
      ))}
    </div>
  )
}

function PortfoliosSuggestSection({ items }) {
  if (!items?.length) return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground italic">
      Aucune donnée disponible
    </div>
  )

  return (
    <div className="space-y-1">
      {items?.map((p, index) => (
        <Link
          key={p.id}
          href={`portfolios/${p.id}`}
          className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-accent hover:shadow-sm"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-6 w-6 items-center justify-center text-xs font-bold text-muted-foreground/50 group-hover:text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground group-hover:text-primary">
                {p.name}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                <Users className="h-3 w-3" />
                {p.followersSize || 0} followers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Annualized</span>
              <VariationContainer
                value={p.annualizedReturn}
                entity="%"
                background={false}
                className="p-0 text-sm font-black"
              />
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
