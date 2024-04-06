'use client'

import SectionContainer from '@/components/molecules/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { round10 } from '@/lib/decimalAjustement'
import portfolioService from '@/services/portfolioService'
import useAuth from 'hooks/UseAuth'
import { Star, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'

interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  allocation: string[]
}
interface PortfoliosPresentation {
  ownPortfolios: PortfolioSummery[]
  bestPerformingPortfolios: PortfolioSummery[]
  mostFollowedPortfolios: PortfolioSummery[]
}

const Portfolios = () => {
  const [data, setData] = React.useState<PortfoliosPresentation>()

  const [authData, isAuthentificated] = useAuth()

  const fetchData = async () => {
    try {
      const res = await portfolioService.getAll()
      setData(res)
    } catch (e) {
      console.log('error api:', e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      {isAuthentificated && (
        <PortfoliosSection
          items={data?.ownPortfolios}
          title={'Mes portefeuilles'}
          ActionButton={() => (
            <Link href={'portfolios/new'}>
              <Button variant={'outline'} size={'sm'}>
                + Nouveau Portefeuille
              </Button>
            </Link>
          )}
        />
      )}

      <PortfoliosSection
        items={data?.bestPerformingPortfolios}
        title={'Les portefeuilles les plus performants'}
      />

      <PortfoliosSection
        items={data?.mostFollowedPortfolios}
        title={'Les portefeuilles les plus suivis'}
      />
    </div>
  )
}

export default Portfolios

function PortfolioCard(p: PortfolioSummery): React.JSX.Element {
  return (
    <Link key={p.id} href={`portfolios/${p.id}`}>
      <Card className="flex h-44 w-full flex-col place-content-between overflow-hidden ">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1">
          <CardTitle className="text-md text-ellipsis font-medium capitalize">{p.name}</CardTitle>
          <div className="flex place-items-center p-1">
            <Star size={14} />
            <span className="xs px-1">{p.followersSize}</span>
          </div>
        </CardHeader>
        <CardContent className="min-h-26 h-16">
          <div className="text-xs font-light">{p.allocation?.length || 0} Actions</div>
          <div className="flex w-full flex-wrap">
            {p.allocation
              ?.filter((element, index) => index < 10)
              .map((s) => (
                <span
                  key={s}
                  className="m-0.5 rounded-sm bg-primary p-0.5 text-xs uppercase text-white"
                >
                  {s}
                </span>
              ))}
            {p?.allocation.length < 10 || (
              <span className="m-0.5 rounded-sm bg-primary p-0.5 text-xs uppercase text-white">
                + autres ...
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <span className="capitalize">performances annualisées</span>
            <TrendingUpIcon></TrendingUpIcon>
            <span>{round10(p.dayChangePercent, -2)}%</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

function PortfoliosSection({ items, title, ActionButton = () => <></> }) {
  return (
    <SectionContainer>
      <div className="flex w-full place-content-between py-6">
        <h2 className="border-b-2 border-primary">{title}</h2>

        {ActionButton && <ActionButton />}
      </div>

      <div className="grid grid-cols-1 place-content-start gap-6  md:grid-cols-2 xl:grid-cols-4 ">
        {items?.map((w) => PortfolioCard(w))}
      </div>
    </SectionContainer>
  )
}
