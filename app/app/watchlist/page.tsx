import SectionContainer from '@/components/molecules/layout/SectionContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicWatchlists } from '@/services/actions'
import { Star, Watch } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default async function Projects() {
  const listWatch = await getPublicWatchlists()

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div>
        <h1>Titre</h1>
        <p>description</p>
      </div>
      <SectionContainer>
        <div className="-m-4 flex flex-wrap gap-1">{listWatch.map((w) => WatchCard(w))}</div>
      </SectionContainer>
    </div>
  )

  function WatchCard(w): React.JSX.Element {
    return (
      <Link key={w._id} href={`watchlist/${w._id}`}>
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
