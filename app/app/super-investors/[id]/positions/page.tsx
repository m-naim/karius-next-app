'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Activity, ArrowUpDown, Check, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import PortfolioTable from '@/components/molecules/table/PortfolioTable'
import {
  ColumnViewPreset,
  ColumnViewPresetManager,
} from '@/components/molecules/table/ColumnViewPresetManager'
import AllocationPie from '../../../portfolios/[id]/AllocationPie'
import PortfolioAssetDrawer from '../../../portfolios/[id]/PortfolioAssetDrawer'
import { columns, PortfolioSecurity } from '../../../portfolios/[id]/columns'
import { getQuotes, getStocksVariations } from '@/services/stock.service'
import {
  ChangeType,
  getSuperInvestorById,
  HoldingView,
  InvestorDetail,
} from '@/services/superInvestorService'

const changeLabels: Record<ChangeType, string> = {
  NEW: 'Nouvelle',
  ADDED: 'Renforcée',
  REDUCED: 'Allégée',
  CLOSED: 'Clôturée',
  UNCHANGED: 'Inchangée',
  NOT_COMPUTABLE: 'Non calculable',
}

const changeStyles: Record<ChangeType, string> = {
  NEW: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  ADDED: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  REDUCED:
    'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  CLOSED: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  UNCHANGED: 'border-border bg-muted/40 text-muted-foreground',
  NOT_COMPUTABLE: 'border-border bg-muted/40 text-muted-foreground',
}

const DEFAULT_VISIBILITY: VisibilityState = {
  symbol: true,
  changeType: true,
  sharesOrPrincipal: true,
  weight: true,
  declaredValue: true,
  regularMarketPrice: true,
  variation: true,
  cusip: false,
  variationPercent: false,
  trailingPE: false,
  forwardPE: false,
  priceToSales: false,
  dividendYield: false,
  marketCap: false,
  roa: false,
  roe: false,
  revGrowth: false,
  roic: false,
  pe5y: false,
  psGrowth5y: false,
  peg5y: false,
  linearity10y: false,
  sector: false,
  industry: false,
  hasFundamentals: false,
}

const VIEW_PRESETS: ColumnViewPreset[] = [
  {
    id: 'summary',
    name: 'Synthèse 13F',
    description:
      'Données officielles, cours et variation réunis dans une vue compacte.',
    icon: '📄',
    isSystem: true,
    columns: {
      symbol: true,
      changeType: true,
      sharesOrPrincipal: true,
      weight: true,
      declaredValue: true,
      regularMarketPrice: true,
      variation: true,
    },
    order: [
      'symbol',
      'weight',
      'regularMarketPrice',
      'variation',
      'changeType',
      'sharesOrPrincipal',
      'declaredValue',
    ],
  },
  {
    id: 'market',
    name: 'Marché',
    description:
      'Cours, variation, poids et classification des positions cotées.',
    icon: '⚡',
    isSystem: true,
    columns: {
      symbol: true,
      weight: true,
      regularMarketPrice: true,
      variation: true,
      sector: true,
      industry: true,
      declaredValue: true,
    },
    order: [
      'symbol',
      'weight',
      'regularMarketPrice',
      'variation',
      'sector',
      'industry',
      'declaredValue',
    ],
  },
  {
    id: 'valuation',
    name: 'Valorisation',
    description:
      'Multiples, rendement et capitalisation des sociétés détenues.',
    icon: '💰',
    isSystem: true,
    columns: {
      symbol: true,
      regularMarketPrice: true,
      trailingPE: true,
      forwardPE: true,
      priceToSales: true,
      dividendYield: true,
      marketCap: true,
      weight: true,
    },
    order: [
      'symbol',
      'regularMarketPrice',
      'trailingPE',
      'forwardPE',
      'priceToSales',
      'dividendYield',
      'marketCap',
      'weight',
    ],
  },
  {
    id: 'quality',
    name: 'Qualité & croissance',
    description: 'Rentabilité, croissance historique et régularité du cours.',
    icon: '💎',
    isSystem: true,
    columns: {
      symbol: true,
      roe: true,
      roa: true,
      roic: true,
      revGrowth: true,
      linearity10y: true,
      hasFundamentals: true,
      weight: true,
    },
    order: [
      'symbol',
      'roe',
      'roa',
      'roic',
      'revGrowth',
      'linearity10y',
      'hasFundamentals',
      'weight',
    ],
  },
]

type InvestorPositionSecurity = PortfolioSecurity & {
  holding: HoldingView
  declaredValue: number
  sharesOrPrincipal: number
  changeType: ChangeType
  changePercent?: number | null
  cusip: string
  resolved: boolean
}

function formatUsd(value: number, compact = false) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value)
}

function SortableHeader({ title, column }: { title: string; column: any }) {
  return (
    <Button
      variant="ghost"
      className="h-8 gap-1 px-1 text-xs"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  )
}

export default function SuperInvestorPositionsPage() {
  const params = useParams()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [quarter, setQuarter] = useState(0)
  const [instrument, setInstrument] = useState<'EQUITY' | 'OPTION'>('EQUITY')
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [useNativeCurrency, setUseNativeCurrency] = useState(false)
  const [quotes, setQuotes] = useState<Record<string, any>>({})
  const [variations, setVariations] = useState<
    Record<string, Record<string, number>>
  >({})
  const [marketLoading, setMarketLoading] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(DEFAULT_VISIBILITY)
  const [selectedSecurity, setSelectedSecurity] =
    useState<InvestorPositionSecurity | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (slug) getSuperInvestorById(slug).then(setInvestor)
  }, [slug])

  const filing = investor?.filings[quarter]
  const sourceHoldings = useMemo(
    () =>
      (instrument === 'EQUITY'
        ? filing?.equityHoldings
        : filing?.optionHoldings) || [],
    [filing, instrument]
  )

  useEffect(() => {
    const symbols = [
      ...new Set(
        sourceHoldings.map((holding) => holding.symbol).filter(Boolean)
      ),
    ] as string[]
    if (symbols.length === 0) {
      setQuotes({})
      setVariations({})
      setMarketLoading(false)
      return
    }
    let active = true
    const controller = new AbortController()
    setMarketLoading(true)
    Promise.all([
      getQuotes(symbols, false, { signal: controller.signal }).catch(() => []),
      getStocksVariations(symbols, false, { signal: controller.signal }).catch(
        () => []
      ),
    ])
      .then(([quoteData, variationData]) => {
        if (!active) return
        const quoteMap: Record<string, any> = {}
        const variationMap: Record<string, Record<string, number>> = {}
        if (Array.isArray(quoteData))
          quoteData.forEach((quote) => {
            if (quote?.symbol) quoteMap[quote.symbol.toUpperCase()] = quote
          })
        if (Array.isArray(variationData))
          variationData.forEach((item) => {
            if (item?.symbol)
              variationMap[item.symbol.toUpperCase()] = item.variations || {}
          })
        setQuotes(quoteMap)
        setVariations(variationMap)
      })
      .finally(() => {
        if (active) setMarketLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [sourceHoldings])

  const data = useMemo<InvestorPositionSecurity[]>(
    () =>
      sourceHoldings.map((holding) => {
        const key = holding.symbol?.toUpperCase() || ''
        const quote = quotes[key] || {}
        return {
          ...quote,
          symbol: holding.symbol || holding.cusip,
          shortname: quote.shortname || quote.longname || holding.issuerName,
          weight: holding.weightPercent / 100,
          totalValue: holding.valueUsd,
          last: quote.regularMarketPrice ?? quote.last ?? 0,
          qty: holding.sharesOrPrincipal,
          bep: 0,
          retour: 0,
          sector: holding.sector || quote.sector,
          industry: quote.industry,
          currency: quote.currency || 'USD',
          dailyVariationPercent: quote.regularMarketChangePercent,
          regularMarketChangePercent: quote.regularMarketChangePercent,
          variations: variations[key] || {},
          holding,
          declaredValue: holding.valueUsd,
          sharesOrPrincipal: holding.sharesOrPrincipal,
          changeType: holding.changeType,
          changePercent: holding.changePercent,
          cusip: holding.cusip,
          resolved: Boolean(holding.symbol),
        }
      }),
    [sourceHoldings, quotes, variations]
  )

  const tableColumns = useMemo(
    () => [
      ...columns(selectedPeriod, 'USD', useNativeCurrency, false),
      {
        accessorKey: 'changeType',
        header: ({ column }: any) => (
          <SortableHeader title="Activité 13F" column={column} />
        ),
        cell: ({ row }: any) => (
          <div className="flex flex-col items-start gap-1">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px]',
                changeStyles[row.original.changeType as ChangeType]
              )}
            >
              {changeLabels[row.original.changeType as ChangeType]}
            </Badge>
            {row.original.changePercent != null && (
              <VariationContainer
                value={row.original.changePercent}
                entity="%"
                background={false}
                className="m-0 p-0 text-[10px]"
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'sharesOrPrincipal',
        header: ({ column }: any) => (
          <SortableHeader title="Quantité" column={column} />
        ),
        cell: ({ row }: any) => (
          <span className="font-mono text-xs tabular-nums">
            {Number(row.original.sharesOrPrincipal).toLocaleString('fr-FR')}
          </span>
        ),
      },
      {
        accessorKey: 'declaredValue',
        header: ({ column }: any) => (
          <SortableHeader title="Valeur déclarée" column={column} />
        ),
        cell: ({ row }: any) => (
          <span className="font-semibold tabular-nums">
            {formatUsd(row.original.declaredValue, true)}
          </span>
        ),
      },
      {
        accessorKey: 'cusip',
        header: ({ column }: any) => (
          <SortableHeader title="CUSIP" column={column} />
        ),
        cell: ({ row }: any) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.cusip}
          </span>
        ),
      },
    ],
    [selectedPeriod, useNativeCurrency]
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      const needle = String(value || '').toLowerCase()
      const position = row.original as InvestorPositionSecurity
      return [
        position.symbol,
        position.shortname,
        position.cusip,
        position.sector,
        position.industry,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle))
    },
  })

  const totalValue = sourceHoldings.reduce(
    (sum, holding) => sum + holding.valueUsd,
    0
  )
  const topHolding = sourceHoldings.reduce<HoldingView | null>(
    (top, holding) =>
      !top || holding.weightPercent > top.weightPercent ? holding : top,
    null
  )
  const changedCount = sourceHoldings.filter(
    (holding) => !['UNCHANGED', 'NOT_COMPUTABLE'].includes(holding.changeType)
  ).length

  if (!filing)
    return <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-0 text-xs font-bold text-primary">
            Positions déclarées
          </p>
          <h2 className="mt-1 p-0 text-2xl font-black">
            Composition 13F enrichie
          </h2>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Données SEC officielles complétées par les cours, variations et
            fondamentaux disponibles.
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Ticker, société, secteur ou CUSIP"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {investor?.filings.map((item, index) => (
          <button
            key={item.snapshotId}
            onClick={() => {
              setQuarter(index)
              setSelectedSecurity(null)
              setIsDrawerOpen(false)
            }}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
              quarter === index
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-muted'
            )}
          >
            <span className="block font-bold">{item.quarterLabel}</span>
            <span className="mt-0.5 block opacity-75">
              {item.validationStatus === 'AMENDED' ? 'Amendé' : 'Validé'}
            </span>
          </button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Valeur déclarée" value={formatUsd(totalValue, true)} />
        <Summary label="Positions" value={String(sourceHoldings.length)} />
        <Summary
          label="Première ligne"
          value={
            topHolding
              ? `${
                  topHolding.symbol || topHolding.cusip
                } · ${topHolding.weightPercent.toFixed(1)} %`
              : '—'
          }
        />
        <Summary
          label="Mouvements"
          value={`${changedCount} au trimestre`}
          last
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs
          value={instrument}
          onValueChange={(value) => {
            setInstrument(value as 'EQUITY' | 'OPTION')
            setSelectedSecurity(null)
            setIsDrawerOpen(false)
          }}
        >
          <TabsList>
            <TabsTrigger value="EQUITY">
              Actions ({filing.equityHoldings.length})
            </TabsTrigger>
            <TabsTrigger value="OPTION">
              Options ({filing.optionHoldings.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Badge variant="outline" className="gap-1.5 font-medium">
          {marketLoading ? (
            <Activity className="h-3.5 w-3.5 animate-pulse text-primary" />
          ) : (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          )}
          {marketLoading
            ? 'Données marché…'
            : `${Object.keys(quotes).length} cotation(s)`}
        </Badge>
      </div>

      <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-6">
        <Card className="min-w-0 flex-1 overflow-hidden border-border bg-card">
          <CardHeader className="space-y-3 border-b border-border bg-muted/30 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold">Investissements</h3>
                <p className="mb-0 text-xs text-muted-foreground">
                  Clique sur une ligne pour ouvrir l’analyse complète.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Période de performance"
                  className="flex items-center gap-0.5 rounded-full border border-border/60 bg-background/80 p-0.5"
                >
                  {['1d', '1w', '1m', '3m', '6m', '1y', '5y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      aria-pressed={selectedPeriod === period}
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-colors',
                        selectedPeriod === period
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full text-[11px]"
                  onClick={() => setUseNativeCurrency((value) => !value)}
                >
                  Devise locale {useNativeCurrency ? 'activée' : 'désactivée'}
                </Button>
                <ColumnViewPresetManager
                  table={table}
                  storageScope="super-investor-positions"
                  systemPresets={VIEW_PRESETS}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PortfolioTable
              table={table}
              colSpan={table.getAllColumns().length}
              selectedSymbol={selectedSecurity?.symbol}
              canOpenRow={(security) => security.resolved}
              onRowClick={(security: InvestorPositionSecurity) => {
                if (!security.resolved) return
                setSelectedSecurity(security)
                setIsDrawerOpen(true)
              }}
            />
          </CardContent>
        </Card>

        {data.length > 0 && (
          <Card className="w-full shrink-0 overflow-hidden border-border bg-card lg:w-80">
            <CardHeader className="border-b border-border/50 px-4 py-3">
              <h3 className="text-sm font-semibold">Répartition déclarée</h3>
            </CardHeader>
            <CardContent className="p-4">
              <AllocationPie
                data={data}
                totalValue={totalValue}
                currency="USD"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {instrument === 'OPTION' && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
          Les options conservent leur valeur officielle trimestrielle dans la
          reconstruction. L’analyse de l’actif sous-jacent reste accessible
          lorsqu’un ticker est résolu.
        </div>
      )}

      <PortfolioAssetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        security={selectedSecurity}
        portfolio={{
          baseCurrency: 'USD',
          totalValue,
          cashValue: 0,
          transactions: [],
        }}
        own={false}
      />
    </main>
  )
}

function Summary({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'min-w-0 px-4 py-3.5',
        !last && 'border-b border-border sm:border-r xl:border-b-0'
      )}
    >
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <strong className="mt-1 block truncate text-sm font-bold tabular-nums">
        {value}
      </strong>
    </div>
  )
}
