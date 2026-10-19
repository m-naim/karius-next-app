'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { ChevronDown, Loader2 } from 'lucide-react'
import { search } from '@/services/stock.service'
import SecurityImage from '@/components/atoms/SecurityImage'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface Security {
  quoteType?: string
  symbol: string
  shortname?: string
  exchange?: string
  longname?: string
  fullExchangeName?: string
}

type AssetFilter = 'all' | 'stocks' | 'etfs'

const POPULAR_STOCKS: Security[] = [
  { symbol: 'MC.PA', shortname: 'LVMH', longname: 'LVMH Moët Hennessy', exchange: 'Paris', quoteType: 'EQUITY' },
  { symbol: 'NVDA', shortname: 'NVIDIA', longname: 'Nvidia Corp', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'AAPL', shortname: 'Apple', longname: 'Apple Inc.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'MSFT', shortname: 'Microsoft', longname: 'Microsoft Corp.', exchange: 'NASDAQ', quoteType: 'EQUITY' },
  { symbol: 'ASML', shortname: 'ASML', longname: 'ASML Holding', exchange: 'Amsterdam', quoteType: 'EQUITY' },
  { symbol: 'TTE.PA', shortname: 'TotalEnergies', longname: 'TotalEnergies SE', exchange: 'Paris', quoteType: 'EQUITY' },
]

const RECENT_STORAGE_KEY = 'boursehorus:stock-search:recent'

function isEtf(item: Security) {
  return item.quoteType === 'ETF'
}

function matchesFilter(item: Security, filter: AssetFilter) {
  if (filter === 'all') return true
  if (filter === 'etfs') return isEtf(item)
  return !isEtf(item)
}

function StockResult({ item }: { item: Security }) {
  const name = item.longname || item.shortname || item.symbol

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500/80 bg-background p-1">
        <SecurityImage symbol={item.symbol} />
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-base font-bold text-foreground">{item.symbol}</span>
          <span className="truncate text-sm text-muted-foreground">{name}</span>
        </div>
      </div>
    </div>
  )
}

export default function StockCommand({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<AssetFilter>('all')
  const [exchangeFilter, setExchangeFilter] = useState('all')
  const [showExchangeMenu, setShowExchangeMenu] = useState(false)
  const [results, setResults] = useState<Security[]>([])
  const [recent, setRecent] = useState<Security[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY)
      setRecent(stored ? (JSON.parse(stored) as Security[]) : [])
    } catch {
      setRecent([])
    }
  }, [open])

  const fetchResults = async (value: string) => {
    if (value.trim().length < 1) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = (await search(value)) as Security[]
      setResults(data || [])
    } catch (error) {
      console.error('Failed to search stocks:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebouncedCallback(fetchResults, 250)

  const visibleResults = useMemo(
    () =>
      results.filter(
        (item) =>
          matchesFilter(item, filter) &&
          (exchangeFilter === 'all' || (item.exchange || item.fullExchangeName) === exchangeFilter)
      ),
    [exchangeFilter, filter, results]
  )

  const visibleRecent = recent.filter((item) => matchesFilter(item, filter))
  const visiblePopular = POPULAR_STOCKS.filter((item) => matchesFilter(item, filter))

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setQuery('')
      setResults([])
      setFilter('all')
      setExchangeFilter('all')
      setShowExchangeMenu(false)
    }
  }

  const handleSelect = (item: Security) => {
    const nextRecent = [item, ...recent.filter((recentItem) => recentItem.symbol !== item.symbol)].slice(0, 6)
    setRecent(nextRecent)
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(nextRecent))
    handleOpenChange(false)
    router.push(`/app/stocks/${item.symbol.toUpperCase()}`)
  }

  const filterButtonClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-border bg-transparent text-muted-foreground hover:border-foreground/50 hover:text-foreground'
    }`

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <div className="bg-background">
        <CommandInput
          autoFocus
          value={query}
          onValueChange={(value) => {
            setQuery(value)
            debouncedSearch(value)
          }}
          placeholder="Rechercher une action ou un ETF..."
          className="h-16 text-lg sm:text-xl"
        />

        <div className="relative flex gap-2 overflow-x-auto border-b px-4 py-3 sm:px-5">
          <button type="button" className={filterButtonClass(filter === 'all')} onClick={() => setFilter('all')}>
            Toutes
          </button>
          <button type="button" className={filterButtonClass(filter === 'stocks')} onClick={() => setFilter('stocks')}>
            Actions
          </button>
          <button type="button" className={filterButtonClass(filter === 'etfs')} onClick={() => setFilter('etfs')}>
            ETFs
          </button>
          <span className="mx-1 my-1.5 h-7 w-px shrink-0 bg-border" />
          <button
            type="button"
            className={`${filterButtonClass(exchangeFilter !== 'all')} flex items-center gap-2`}
            onClick={() => setShowExchangeMenu((current) => !current)}
            aria-expanded={showExchangeMenu}
          >
            {exchangeFilter === 'all' ? 'Marché' : exchangeFilter}
            <ChevronDown className={`h-4 w-4 transition-transform ${showExchangeMenu ? 'rotate-180' : ''}`} />
          </button>

          {showExchangeMenu && (
            <div className="absolute left-4 top-full z-10 mt-1 min-w-40 rounded-lg border bg-popover p-1 shadow-lg sm:left-auto sm:right-5">
              {['all', 'Paris', 'NASDAQ', 'Amsterdam'].map((exchange) => (
                <button
                  key={exchange}
                  type="button"
                  className="flex w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    setExchangeFilter(exchange)
                    setShowExchangeMenu(false)
                  }}
                >
                  {exchange === 'all' ? 'Tous les marchés' : exchange}
                </button>
              ))}
            </div>
          )}
        </div>

        <CommandList className="max-h-[calc(100dvh-8.5rem)] px-2 py-3 sm:max-h-[min(520px,calc(100vh-12rem))] sm:px-3">
          {query.trim().length > 0 ? (
            <>
              {loading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Recherche en cours...
                </div>
              )}
              {!loading && visibleResults.length === 0 && (
                <CommandEmpty>Aucun titre trouvé.</CommandEmpty>
              )}
              {!loading && visibleResults.length > 0 && (
                <CommandGroup heading="Résultats">
                  {visibleResults.map((item) => (
                    <CommandItem
                      key={`${item.symbol}-${item.exchange}`}
                      value={`${item.symbol} ${item.longname || ''} ${item.exchange || ''}`}
                      onSelect={() => handleSelect(item)}
                      className="min-h-14 gap-3 px-3 py-2.5"
                    >
                      <StockResult item={item} />
                      <span className="shrink-0 text-xs text-muted-foreground">{item.exchange || '—'}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <>
              {visibleRecent.length > 0 && (
                <CommandGroup heading="Récents">
                  {visibleRecent.map((item) => (
                    <CommandItem
                      key={`recent-${item.symbol}`}
                      value={`${item.symbol} ${item.longname || ''} ${item.exchange || ''}`}
                      onSelect={() => handleSelect(item)}
                      className="min-h-14 gap-3 px-3 py-2.5"
                    >
                      <StockResult item={item} />
                      <span className="shrink-0 text-xs text-muted-foreground">{item.exchange || '—'}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {visibleRecent.length > 0 && <CommandSeparator />}

              <CommandGroup heading="Populaires">
                {visiblePopular.map((item) => (
                  <CommandItem
                    key={`popular-${item.symbol}`}
                    value={`${item.symbol} ${item.longname || ''} ${item.exchange || ''}`}
                    onSelect={() => handleSelect(item)}
                    className="min-h-14 gap-3 px-3 py-2.5"
                  >
                    <StockResult item={item} />
                    <span className="shrink-0 text-xs text-muted-foreground">{item.exchange || '—'}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  )
}
