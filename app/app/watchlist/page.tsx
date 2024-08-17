import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicWatchlists } from '@/services/actions'
import { Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default async function Projects() {
  const listWatch = await getPublicWatchlists()

  return (
    <>
      <SectionContainer>
        <div className="flex w-full place-content-between py-6">
          <h2 className="border-b-2 border-primary">Mes watchlists</h2>

          <Link data-umami-event="portfolios-new-button" href={'watchlist/new'}>
            <Button data-umami-event="portfolios-new-button" variant={'outline'} size={'sm'}>
              + Ajouter une watchlist
            </Button>
          </Link>
        </div>
      </SectionContainer>

      <div className="my-12 flex w-full place-content-center text-center ">
        <h1 className="text-3xl">Découvrez les meilleurs portefeuilles de la communauté</h1>
      </div>

      <SectionContainer>
        <div className="grid w-full grid-cols-[repeat(auto-fill,20rem)] justify-center gap-6 overflow-auto">
          {listWatch.map((w) => WatchCard(w))}
        </div>
      </SectionContainer>
    </>
  )

  function WatchCard(w): React.JSX.Element {
    return (
      <Link data-umami-event={`watchlist/${w._id}`} key={w._id} href={`watchlist/${w._id}`}>
        <Card className="h-32 w-[20rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-md font-medium capitalize">{w.name}</CardTitle>
            <div className="flex place-items-center gap-1 rounded-md bg-gray-100 p-1">
              <Star size={16} />
              <span className="xs px-1">0</span>
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="text-xs font-light">{w.securities?.length || 0} Actions</div>
            <div className="flex w-full flex-wrap">
              {w.securities
                ?.filter((element, index) => index < 10)
                .map((s) => (
                  <span
                    key={s.symbol}
                    className="m-0.5 rounded-sm bg-primary p-0.5 text-xs uppercase text-white"
                  >
                    {s.symbol}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }
}
