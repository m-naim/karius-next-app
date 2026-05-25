'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { TrendingUp, Globe, ShieldCheck, PieChart, Landmark, Activity, Zap, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { MarketPulse } from '@/components/molecules/market/MarketPulse'

const markets = [
  {
    symbol: 'SPY',
    name: 'S&P 500',
    description: 'Les 500 plus grandes entreprises américaines, référence mondiale de la performance boursière.',
    icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
    tags: ['US', 'Large Cap', 'Standard'],
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100',
    description: 'Indice technologique regroupant les 100 plus grandes valeurs non financières du Nasdaq.',
    icon: <PieChart className="h-6 w-6 text-purple-500" />,
    tags: ['US', 'Tech', 'Growth'],
  },
  {
    symbol: 'QWLD',
    name: 'MSCI World Quality',
    description: 'Entreprises aux fondamentaux solides : ROE élevé, croissance stable et faible endettement.',
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
    tags: ['Global', 'Quality', 'Smart Beta'],
  },
  {
    symbol: 'URTH',
    name: 'MSCI World',
    description: 'Large couverture mondiale sur 23 marchés développés.',
    icon: <Globe className="h-6 w-6 text-cyan-500" />,
    tags: ['Global', 'Developed'],
  },
  {
    symbol: 'MEUD.PAR',
    name: 'STOXX Europe 600',
    description: 'La référence majeure du marché actions européen à travers 17 pays.',
    icon: <Landmark className="h-6 w-6 text-orange-500" />,
    tags: ['Europe', 'Broad Market'],
  },
]

export default function MarketListingPage() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section with Market Pulse */}
      <SectionContainer>
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Tableau de Bord <span className="text-primary">Marché</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
              Comprendre les tendances mondiales, analyser les flux de capitaux et identifier les opportunités.
            </p>
          </motion.div>
        </div>

        {/* Pulse Bar */}
        <MarketPulse />
      </SectionContainer>

      {/* Educational Context / Market Summary */}
      <SectionContainer>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-none bg-primary/5 shadow-none lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Activity size={20} />
              </div>
              <CardTitle className="text-xl font-bold">État du Marché</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-600">
                Le marché est actuellement influencé par les politiques monétaires et les résultats technologiques. 
                Une rotation sectorielle est en cours vers les valeurs de croissance. Suivez les indices de volatilité 
                pour évaluer le sentiment global (Peur vs Cupidité).
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  Volatility: Low
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  Trend: Bullish
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gray-50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Info size={18} className="text-gray-400" />
                Pourquoi regarder ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">S&P 500</span> : Représente 80% de la capitalisation US.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">Nasdaq</span> : Coeur de l'innovation technologique.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">Magnificent 7</span> : Les 7 géants qui tirent le marché.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionContainer>

      {/* ETFs & Indices Details */}
      <SectionContainer className="space-y-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Explorateur d'Indices & ETF
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Détails profonds sur les véhicules d'investissement passifs les plus populaires.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <Link key={market.symbol} href={`/app/market/${encodeURIComponent(market.symbol)}`}>
              <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="rounded-2xl bg-gray-50 p-3 transition-colors group-hover:bg-primary/5">
                    {market.icon}
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{market.name}</CardTitle>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {market.symbol}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {market.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {market.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md border border-gray-100 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-gray-600 transition-colors group-hover:border-primary/20 group-hover:text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <div className="absolute bottom-0 h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </Card>
            </Link>
          ))}
        </div>
      </SectionContainer>
    </div>
  )
}
