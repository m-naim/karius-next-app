'use client'

import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import authService from '@/services/authService'
import { getAll } from '@/services/portfolioService'
import { Flame, Star, StarIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'

interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  cumulativePerformance: number
  allocation: string[]
  annualizedReturn: number
}
interface PortfoliosPresentation {
  ownPortfolios: PortfolioSummery[]
  bestPerformingPortfolios: PortfolioSummery[]
  mostFollowedPortfolios: PortfolioSummery[]
}

const Portfolios = () => {
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
    fetchData()
  }, [])

  return (
    <div className="space-y-12 py-8">
      {authentificated && (
        <SectionContainer className="space-y-6">
          <div className="flex w-full flex-col items-center px-4 text-center">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
              Mes portefeuilles
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
              Gérez et analysez vos investissements
            </p>
            <div className="mt-4">
              <Button asChild data-umami-event="portfolios-new-button" size={'sm'}>
                <Link data-umami-event="portfolios-new-button" href={'portfolios/new'}>
                  + Créer un nouveau portefeuille
                </Link>
              </Button>
            </div>
          </div>

          <PortfoliosSection items={data?.ownPortfolios} />
        </SectionContainer>
      )}

      <SectionContainer className="space-y-6">
        <div className="flex w-full flex-col items-center px-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl md:text-3xl">
            Découvrez les meilleurs portefeuilles de la communauté
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-red-500" fill="currentColor" />
                Les plus performants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfoliosSuggestSection items={data?.bestPerformingPortfolios} />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                Les plus suivis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfoliosSuggestSection items={data?.mostFollowedPortfolios} />
            </CardContent>
          </Card>
        </div>
      </SectionContainer>
    </div>
  )
}

export default Portfolios

function PortfolioCard(p: PortfolioSummery): React.JSX.Element {
  return (
    <Link key={p.id} href={`portfolios/${p.id}`} className="group block h-full">
      <Card className="flex h-full flex-col justify-between transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="truncate text-lg font-bold capitalize group-hover:text-primary">
            {p.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span>{p.followersSize || 0} abonnés</span>
            </div>

            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TrendingUpIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Performances annualisées</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <VariationContainer
                value={p.annualizedReturn}
                entity="%"
                background={false}
                className="p-0 font-semibold"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PortfoliosSection({ items }) {
  if (!items?.length) return null
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((w) => (
        <PortfolioCard key={w.id} {...w} />
      ))}
    </div>
  )
}

function PortfoliosSuggestSection({ items }) {
  return (
    <div className="flex w-full flex-col gap-6">
      {items?.map((p, index) => (
        <Link
          className="grid grid-cols-2 p-2 hover:bg-gray-500/10"
          key={p.id}
          href={`portfolios/${p.id}`}
        >
          <div className="text-md text-ellipsis p-1 font-medium capitalize">
            <span className="mx-2">{index + 1}</span>
            {p.name}
          </div>

          <div className="grid max-w-[140px] grid-cols-2 gap-1">
            <div className="flex place-items-center p-1">
              <Star fill="#eedd00" stroke="#eedd00" size={18} />
              <span className="xs px-1">{p.followersSize || 0}</span>
            </div>

            <div className="flex gap-1 p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <TrendingUpIcon className="h-4 w-4" size={18} />
                  </TooltipTrigger>
                  <TooltipContent>Performances annualisées</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <VariationContainer
                value={p.annualizedReturn}
                entity="%"
                background={false}
                className="m-0 p-0 py-2"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
