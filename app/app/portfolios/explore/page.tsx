'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getPublicPortfolios } from '@/services/portfolioService'
import { Star, TrendingUpIcon, Search, Filter } from 'lucide-react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'

interface PortfolioSummery {
  id: string
  name: string
  followersSize: number
  dayChangePercent: number
  cumulativePerformance: number
  allocation: string[]
  annualizedReturn: number
}

export default function ExplorePortfoliosPage() {
  const [portfolios, setPortfolios] = useState<PortfolioSummery[]>([])
  const [filteredPortfolios, setFilteredPortfolios] = useState<PortfolioSummery[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const data = await getPublicPortfolios()
        setPortfolios(data)
        setFilteredPortfolios(data)
      } catch (error) {
        console.error('Error fetching public portfolios:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  useEffect(() => {
    const results = portfolios.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPortfolios(results)
  }, [searchTerm, portfolios])

  return (
    <SectionContainer className="py-8">
      <div className="mb-12 flex w-full flex-col items-center px-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          Explorer les Portefeuilles
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-500">
          Découvrez et inspirez-vous des meilleurs portefeuilles publics de la communauté.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un portefeuille..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{filteredPortfolios.length} portefeuilles trouvés</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : filteredPortfolios.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPortfolios.map((p) => (
            <PortfolioCard key={p.id} {...p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Aucun portefeuille trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </SectionContainer>
  )
}

function PortfolioCard(p: PortfolioSummery): React.JSX.Element {
  return (
    <Link key={p.id} href={`/app/portfolios/${p.id}`} className="group block h-full">
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
