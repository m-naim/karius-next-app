import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, TrendingUp, Users, Wallet, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  cumulativePerformance: number
  allocation: string[]
  annualizedReturn: number
}

export function PortfolioCard(p: PortfolioSummery) {
  return (
    <Link
      key={p.id}
      href={`portfolios/${p.id}`}
      className="group block w-full"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "border-gray-200 bg-white/50 backdrop-blur-sm",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
      )}>
        {/* Subtle decorative background element */}
        <div className="absolute -right-4 -top-4 opacity-[0.03] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
          <Wallet size={100} />
        </div>

        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="line-clamp-1 text-sm font-bold tracking-tight text-gray-800 sm:text-base">
                {p.name}
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {p.followersSize || 0} abonnés
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <VariationContainer
                  value={p.annualizedReturn}
                  entity="%"
                  background={false}
                  className="p-0 font-bold"
                />
              </span>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-gray-400 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Performance Annualisée</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {p.allocation?.slice(0, 3).map((symbol) => (
              <span
                key={symbol}
                className="inline-flex items-center rounded-md border border-gray-100 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-gray-600 transition-colors group-hover:border-primary/20 group-hover:text-primary"
              >
                {symbol}
              </span>
            ))}
            {p.allocation?.length > 3 && (
              <span className="inline-flex items-center px-1 text-[9px] font-bold text-gray-400">
                +{p.allocation.length - 3}
              </span>
            )}
            {(!p.allocation || p.allocation.length === 0) && (
              <span className="text-[9px] italic text-gray-400">Aucun actif</span>
            )}
          </div>
        </CardContent>
        
        {/* Bottom accent line */}
        <div className="h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      </Card>
    </Link>
  )
}
