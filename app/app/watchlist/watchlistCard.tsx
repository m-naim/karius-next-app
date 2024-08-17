import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { WatchListInfos } from './page'

export function WatchCard({
  data,
  displayContent = true,
}: {
  data: WatchListInfos
  displayContent?: boolean
}) {
  return (
    <Link data-umami-event={`watchlist/${data._id}`} href={`watchlist/${data._id}`}>
      <Card className="h-32 w-[20rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-md font-medium capitalize">{data.name}</CardTitle>
          <div className="flex place-items-center gap-1 rounded-md bg-gray-100 p-1">
            <Star size={16} />
            <span className="xs px-1">0</span>
          </div>
        </CardHeader>
        {displayContent && (
          <CardContent className="">
            <div className="text-xs font-light">{data.securities?.length || 0} Actions</div>
            <div className="flex w-full flex-wrap">
              {data.securities
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
        )}
      </Card>
    </Link>
  )
}
