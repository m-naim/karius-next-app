'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { TrendingUp, Globe, ShieldCheck, PieChart, Landmark } from 'lucide-react'

const markets = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    description: 'The 500 largest US companies, the global benchmark for equity performance.',
    icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
    tags: ['US', 'Large Cap', 'Standard'],
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    description:
      'Technology-heavy index including the 100 largest non-financial companies on Nasdaq.',
    icon: <PieChart className="h-8 w-8 text-purple-500" />,
    tags: ['US', 'Tech', 'Growth'],
  },
  {
    symbol: 'QWLD',
    name: 'MSCI World Quality',
    description:
      'Companies with strong fundamentals: high ROE, stable earnings growth, and low debt.',
    icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
    tags: ['Global', 'Quality', 'Smart Beta'],
  },
  {
    symbol: 'URTH',
    name: 'MSCI World',
    description: 'Broad global equity coverage across 23 developed markets.',
    icon: <Globe className="h-8 w-8 text-cyan-500" />,
    tags: ['Global', 'Developed'],
  },
  {
    symbol: 'MEUD.PAR',
    name: 'STOXX Europe 600',
    description: 'The major benchmark for the European equity market across 17 countries.',
    icon: <Landmark className="h-8 w-8 text-orange-500" />,
    tags: ['Europe', 'Broad Market'],
  },
]

export default function MarketListingPage() {
  return (
    <SectionContainer className="py-8">
      <div className="mb-12 flex w-full flex-col items-center px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Indices de Marché
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Analysez la composition et les performances des principaux indices mondiaux.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <Link key={market.symbol} href={`/app/market/${encodeURIComponent(market.symbol)}`}>
            <Card className="group h-full transition-all duration-200 hover:border-primary hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-primary/5">
                  {market.icon}
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-xl font-bold">{market.name}</CardTitle>
                  <span className="text-sm font-medium uppercase text-muted-foreground">
                    {market.symbol}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-3 text-sm text-gray-500">{market.description}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {market.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </SectionContainer>
  )
}
