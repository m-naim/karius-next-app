import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, ListMusic, CalendarDays, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { WatchListInfos } from './page'
import { cn } from '@/lib/utils'

export function WatchCard({
  data,
  displayContent = true,
}: {
  data: WatchListInfos
  displayContent?: boolean
}) {
  const securityCount = data?.securities?.length || 0
  const lastUpdate = data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }) : null

  return (
    <Link
      data-umami-event={`watchlist/${data._id}`}
      href={`watchlist/${data._id}`}
      className="group block w-full"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-border bg-card/50 backdrop-blur-sm",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      )}>

        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Star className="h-3.5 w-3.5 fill-primary/20" />
              </div>
              <CardTitle className="line-clamp-1 text-sm font-bold tracking-tight text-foreground sm:text-base">
                {data.name}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ListMusic className="h-3 w-3" />
                {securityCount} actifs
              </span>
              {lastUpdate && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {lastUpdate}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <span className="text-[10px] font-bold">0</span>
            <Star className="h-3 w-3" />
          </div>
        </CardHeader>

        {displayContent && securityCount > 0 && (
          <CardContent className="p-4 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {data.securities
                .slice(0, 4)
                .map((s) => (
                  <span
                    key={s.symbol}
                    className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary"
                  >
                    {s.symbol}
                  </span>
                ))}
              {securityCount > 4 && (
                <span className="inline-flex items-center px-1 text-[9px] font-bold text-muted-foreground/50">
                  +{securityCount - 4}
                </span>
              )}
            </div>
          </CardContent>
        )}
        
        {/* Bottom accent line */}
        <div className="h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      </Card>
    </Link>
  )
}
