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
    <Link
      data-umami-event={`watchlist/${data._id}`}
      href={`watchlist/${data._id}`}
      className="w-full"
    >
      <Card className="h-auto min-h-[8rem] w-full transition-colors duration-200 hover:bg-gray-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4">
          <div className="space-y-1">
            <CardTitle className="line-clamp-1 text-sm font-medium capitalize sm:text-base">
              {data.name}
            </CardTitle>
            <p className="text-xs text-gray-500">{data.securities?.length || 0} Actions</p>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1.5">
            <Star className="h-4 w-4" />
            <span className="px-0.5 text-xs font-medium">0</span>
          </div>
        </CardHeader>
        {displayContent && (
          <CardContent className="p-3 pt-0 sm:p-4">
            <div className="flex w-full flex-wrap gap-1">
              {data.securities
                ?.filter((element, index) => index < 6)
                .map((s) => (
                  <span
                    key={s.symbol}
                    className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-primary sm:text-xs"
                  >
                    {s.symbol}
                  </span>
                ))}
              {data.securities.length > 6 && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 sm:text-xs">
                  +{data.securities.length - 6}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
