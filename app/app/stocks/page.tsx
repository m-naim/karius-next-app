'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { search } from '@/services/stock.service'
import SecurityImage from '@/components/atoms/SecurityImage'
import { Input } from '@/components/ui/input'
import { Search, Loader2, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

interface Security {
  quoteType: string
  symbol: string
  shortname: string
  exchange: string
  longname?: string
  fullExchangeName: string
}

const POPULAR_STOCKS = [
  { symbol: 'MC.PA', name: 'LVMH', type: 'EQUITY', exchange: 'Paris' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'EQUITY', exchange: 'NASDAQ' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'EQUITY', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'EQUITY', exchange: 'NASDAQ' },
  { symbol: 'TTE.PA', name: 'TotalEnergies SE', type: 'EQUITY', exchange: 'Paris' },
  { symbol: 'AI.PA', name: 'Air Liquide', type: 'EQUITY', exchange: 'Paris' },
]

export default function StockSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Security[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    if (value.trim().length < 1) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data: Security[] = await search(value)
      setResults(data || [])
    } catch (error) {
      console.error('Failed to search stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebouncedCallback(handleSearch, 300)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    debouncedSearch(val)
  }

  const handleSelect = (symbol: string) => {
    router.push(`/app/stocks/${symbol.toUpperCase()}`)
  }

  // Group results by quoteType
  const equities = results.filter((s) => s.quoteType === 'EQUITY')
  const etfs = results.filter((s) => s.quoteType === 'ETF')
  const cryptos = results.filter((s) => s.quoteType === 'CRYPTOCURRENCY')

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-semibold text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Analyses en temps réel</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          Rechercher une{' '}
          <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Valeur
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-3 max-w-md text-base text-muted-foreground sm:text-lg"
        >
          Accédez aux graphiques techniques, fondamentaux et aux mesures de valorisation.
        </motion.p>
      </div>

      {/* Search Input Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="relative flex items-center rounded-xl border bg-card p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:focus-within:ring-offset-background transition-all">
          <Search className="ml-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou symbole (ex: LVMH, AAPL, MC.PA)..."
            value={query}
            onChange={onInputChange}
            className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/75"
          />
          {loading && (
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      </motion.div>

      {/* Results / Suggestions */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {query.trim().length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {results.length === 0 && !loading ? (
                <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
                  Aucun résultat trouvé pour &quot;{query}&quot;
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Equities */}
                  {equities.length > 0 && (
                    <Card className="overflow-hidden border bg-card/50 backdrop-blur-sm">
                      <div className="py-4 px-6 border-b">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" /> Actions
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {equities.map((item) => (
                          <div
                            key={`${item.symbol}-${item.exchange}`}
                            onClick={() => handleSelect(item.symbol)}
                            className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background group-hover:border-primary/50 transition-colors">
                                <SecurityImage symbol={item.symbol} />
                              </div>
                              <div>
                                <div className="font-bold flex items-center gap-1.5 text-foreground group-hover:text-primary transition-colors">
                                  {item.symbol}
                                </div>
                                <div className="text-sm text-muted-foreground max-w-[20rem] sm:max-w-md truncate">
                                  {item.longname || item.shortname}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {item.exchange}
                              </Badge>
                              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* ETFs */}
                  {etfs.length > 0 && (
                    <Card className="overflow-hidden border bg-card/50 backdrop-blur-sm">
                      <div className="py-4 px-6 border-b">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          ETFs
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {etfs.map((item) => (
                          <div
                            key={`${item.symbol}-${item.exchange}`}
                            onClick={() => handleSelect(item.symbol)}
                            className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background group-hover:border-primary/50 transition-colors">
                                <SecurityImage symbol={item.symbol} />
                              </div>
                              <div>
                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                  {item.symbol}
                                </div>
                                <div className="text-sm text-muted-foreground max-w-[20rem] sm:max-w-md truncate">
                                  {item.longname || item.shortname}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {item.exchange}
                              </Badge>
                              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Cryptos */}
                  {cryptos.length > 0 && (
                    <Card className="overflow-hidden border bg-card/50 backdrop-blur-sm">
                      <div className="py-4 px-6 border-b">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          Cryptomonnaies
                        </h3>
                      </div>
                      <div className="divide-y divide-border">
                        {cryptos.map((item) => (
                          <div
                            key={`${item.symbol}-${item.exchange}`}
                            onClick={() => handleSelect(item.symbol)}
                            className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background group-hover:border-primary/50 transition-colors">
                                <SecurityImage symbol={item.symbol} />
                              </div>
                              <div>
                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                  {item.symbol}
                                </div>
                                <div className="text-sm text-muted-foreground max-w-[20rem] sm:max-w-md truncate">
                                  {item.longname || item.shortname}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {item.exchange}
                              </Badge>
                              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="popular"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Valeurs Populaires
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {POPULAR_STOCKS.map((stock) => (
                  <Card
                    key={stock.symbol}
                    onClick={() => handleSelect(stock.symbol)}
                    className="group cursor-pointer border bg-card/60 transition-all hover:bg-accent/45 hover:shadow-md hover:border-primary/40"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background group-hover:border-primary/30 transition-colors">
                          <SecurityImage symbol={stock.symbol} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {stock.exchange}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
