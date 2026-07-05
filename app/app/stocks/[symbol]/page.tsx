'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStock, search } from '@/services/stock.service'
import { TickerChart } from '../../watchlist/[id]/components/TickerChart'
import SecurityImage from '@/components/atoms/SecurityImage'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Loader2, TrendingUp, TrendingDown, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { motion, AnimatePresence } from 'framer-motion'

interface Security {
  quoteType: string
  symbol: string
  shortname: string
  exchange: string
  longname?: string
  fullExchangeName: string
}

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
  const router = useRouter()
  const symbol = (params?.symbol as string)?.toUpperCase() || ''

  const [stock, setStock] = useState<StockDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Mini search bar states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Security[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMiniSearch = async (value: string) => {
    if (value.trim().length < 1) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    try {
      const data: Security[] = await search(value)
      setSearchResults(data || [])
    } catch (err) {
      console.error('Failed to search in mini bar:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const debouncedMiniSearch = useDebouncedCallback(handleMiniSearch, 300)

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    setShowDropdown(true)
    debouncedMiniSearch(val)
  }

  const selectStock = (newSymbol: string) => {
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    router.push(`/app/stocks/${newSymbol.toUpperCase()}`)
  }

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

  const isPositive = (stock.regularMarketChangePercent || 0) >= 0
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: stock.currency || 'EUR',
  }).format(stock.regularMarketPrice || 0)

  const changeSign = isPositive ? '+' : ''
  const formattedChange = `${changeSign}${(stock.regularMarketChange || 0).toFixed(2)} (${changeSign}${(stock.regularMarketChangePercent || 0).toFixed(2)}%)`

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/app/stocks">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card shadow-sm">
              <SecurityImage symbol={stock.symbol} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  {stock.longname || stock.shortname}
                </h1>
                <Badge variant="secondary" className="font-mono text-xs">
                  {stock.symbol}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{stock.exchange}</p>
            </div>
          </div>
        </div>

        {/* Real-time Price and Mini Search */}
        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          {/* Price details */}
          <div className="text-left sm:text-right">
            <div className="text-2xl font-black text-foreground">{formattedPrice}</div>
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{formattedChange}</span>
            </div>
          </div>

          {/* Mini Search input with dropdown */}
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <div className="relative flex items-center rounded-md border bg-card px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              <Input
                type="text"
                placeholder="Rechercher un autre symbole..."
                value={searchQuery}
                onChange={onSearchChange}
                className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/75"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setShowDropdown(false)
                  }}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showDropdown && (searchQuery.trim().length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg focus:outline-none sm:w-80"
                >
                  {searchLoading ? (
                    <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Rechercher...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Aucun résultat.
                    </div>
                  ) : (
                    <div className="p-1 divide-y divide-border/40">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.symbol}-${item.exchange}`}
                          onClick={() => selectStock(item.symbol)}
                          className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground rounded"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <SecurityImage symbol={item.symbol} />
                            <div className="overflow-hidden">
                              <div className="font-bold truncate">{item.symbol}</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {item.longname || item.shortname}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono text-[9px] scale-90">
                            {item.exchange}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Stock Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border bg-card/40 shadow-sm">
          <CardContent className="p-6">
            <TickerChart symbol={symbol} />
          </CardContent>
        </Card>
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
