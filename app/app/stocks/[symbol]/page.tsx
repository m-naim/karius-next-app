'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStock } from '@/services/stock.service'
import { TickerChart } from '../../watchlist/[id]/components/TickerChart'
import SecurityImage from '@/components/atoms/SecurityImage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, TrendingUp, TrendingDown } from 'lucide-react'

interface StockDetails {
  symbol: string
  exchange: string
  shortname: string
  longname: string
  sector?: string
  industry?: string
  currency?: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
}

export default function StockDetailPage() {
  const params = useParams()
  const symbol = (params?.symbol as string)?.toUpperCase() || ''

  const [stock, setStock] = useState<StockDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!symbol) return

    setLoading(true)
    setError(false)
    getStock(symbol)
      .then((data) => {
        if (data) {
          setStock(data)
        } else {
          setError(true)
        }
      })
      .catch((err) => {
        console.error('Error fetching stock details:', err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [symbol])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des données de {symbol}...</p>
        </div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="container mx-auto max-w-md py-20 text-center">
        <Card className="border-dashed p-8">
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-destructive">Valeur introuvable</h2>
            <p className="text-sm text-muted-foreground">
              Impossible de charger les informations pour &quot;{symbol}&quot;.
            </p>
            <div className="pt-2">
              <Button asChild>
                <Link href="/app/stocks">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la recherche
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasPrice = typeof stock.regularMarketPrice === 'number' && Number.isFinite(stock.regularMarketPrice)
  const hasChange =
    typeof stock.regularMarketChange === 'number' &&
    Number.isFinite(stock.regularMarketChange) &&
    typeof stock.regularMarketChangePercent === 'number' &&
    Number.isFinite(stock.regularMarketChangePercent)
  const isPositive = hasChange && (stock.regularMarketChangePercent || 0) >= 0
  const formattedPrice = hasPrice
    ? new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: stock.currency || 'EUR',
      }).format(stock.regularMarketPrice as number)
    : '— €'

  const changeSign = isPositive ? '+' : ''
  const formattedChange = hasChange
    ? `${changeSign}${stock.regularMarketChange?.toFixed(2)} (${changeSign}${stock.regularMarketChangePercent?.toFixed(2)}%)`
    : 'Cours indisponible'

  return (
    <div className="container mx-auto space-y-5 px-4 pb-20 pt-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Stock identity and quote */}
      <div className="border-b pb-5 sm:pb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/app/stocks">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex min-w-0 flex-1 items-start gap-3" title={stock.longname || stock.shortname}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card">
              <SecurityImage symbol={stock.symbol} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="truncate py-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {stock.shortname || stock.longname}
                </h1>
                <Badge variant="secondary" className="font-mono text-xs">
                  {stock.symbol}
                </Badge>
              </div>
              <p className="mb-0 mt-1 truncate text-xs text-muted-foreground">
                {stock.symbol} · {stock.exchange}
              </p>
            </div>
          </div>
        </div>

        {/* Quote and mini search */}
        <div className="mt-4">
          <div className="text-left">
            <div className="text-2xl font-bold text-foreground">{formattedPrice}</div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${hasChange ? (isPositive ? 'text-emerald-500' : 'text-rose-500') : 'text-muted-foreground'}`}>
              {hasChange && (isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />)}
              <span>{formattedChange}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Stock Chart Section */}
      <div className="min-w-0">
        <TickerChart symbol={symbol} compact />
      </div>

      {/* Basic Stock Metadata Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stock.sector && (
          <Card className="bg-card/20 border">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Secteur</div>
              <div className="mt-1 font-bold text-sm text-foreground">{stock.sector}</div>
            </CardContent>
          </Card>
        )}
        {stock.industry && (
          <Card className="bg-card/20 border">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Industrie</div>
              <div className="mt-1 font-bold text-sm text-foreground">{stock.industry}</div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-card/20 border">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Symbole</div>
            <div className="mt-1 font-bold text-sm text-foreground">{stock.symbol}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/20 border">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Devise</div>
            <div className="mt-1 font-bold text-sm text-foreground">{stock.currency || 'EUR'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
