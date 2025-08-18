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
    <div>
      {authentificated && (
        <SectionContainer>
          <div className="flex w-full place-content-between py-6">
            <h2>Mes portefeuilles</h2>
          </div>

          <PortfoliosSection items={data?.ownPortfolios} />

          <Button className="mt-4" asChild data-umami-event="portfolios-new-button" size={'sm'}>
            <Link data-umami-event="portfolios-new-button" href={'portfolios/new'}>
              + Crée un nouveau Portefeuille
            </Link>
          </Button>
        </SectionContainer>
      )}

      <div className="mt-12 flex w-full place-content-center text-center ">
        <h1 className="text-3xl">Découvrez les meilleurs portefeuilles de la communauté</h1>
      </div>

      <SectionContainer>
        <div className="flex w-full flex-col place-content-between gap-2 md:flex-row">
          <Card className="w-full max-w-xl">
            <CardHeader className="flex">
              <CardTitle className="text-md flex gap-2">
                <Flame fill="#ff0000" stroke="#ff0000" />
                les plus performants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfoliosSuggestSection items={data?.bestPerformingPortfolios} />
            </CardContent>
          </Card>

          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-md flex gap-2">
                <StarIcon size={24} fill="#eedd00" stroke="#eedd00" />
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
    <Link key={p.id} href={`portfolios/${p.id}`}>
      <Card className="flex  w-full flex-col place-content-between overflow-hidden p-1">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1">
          <div className="text-md text-ellipsis p-1 font-medium capitalize">{p.name}</div>

          <div className="grid max-w-[140px] grid-cols-2 gap-1">
            <div className="flex place-items-center p-1">
              <Star size={14} />
              <span className="xs px-1">{p.followersSize || 0}</span>
            </div>

            <div className="flex gap-2 p-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TrendingUpIcon className="h-4 w-4" size={14} />
                  </TooltipTrigger>
                  <TooltipContent>Performances annualisées</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <VariationContainer value={p.annualizedReturn} entity="%" background={false} />
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

function PortfoliosSection({ items }) {
  return <div className="flex max-w-md flex-col gap-6">{items?.map((w) => PortfolioCard(w))}</div>
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
