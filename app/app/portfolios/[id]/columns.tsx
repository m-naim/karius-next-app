'use client'

import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { ChevronUp, ArrowUpDown, ChevronDown, Info, ListFilterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { genericNumericFilterFn } from '@/lib/table-filters'


// Fonction pour obtenir les initiales
const getInitials = (str: string) => {
  return str
    .split(/\W/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export interface PortfolioSecurity {
  symbol: string
  weight: number
  totalValue: number
  last: number
  qty: number
  bep: number
  retour: number
  sector?: string
  industry?: string
  qualityMetrics?: any
  marketCap?: number | null
  trailingPE?: number | null
  forwardPE?: number | null
  dividendYield?: number | null
  linearity10y?: number | null
  priceToSales?: number | null
  totalRevenue?: number | null
  roa?: number | null
  roe?: number | null
  currency?: string
  nativeBep?: number
  shortname?: string
  dailyVariationPercent?: number | null
  regularMarketChangePercent?: number | null
  variations?: Record<string, number>
}

type FiltrProps = {
  column: Column<PortfolioSecurity>
}

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  'Produit x Quantité': 'Ticker de la position et quantité détenue. La quantité est masquée pour les portefeuilles publics.',
  Produit: 'Ticker et nom de l’action ou de l’ETF.',
  Poids: 'Part actuelle de cette position dans la valeur totale du portefeuille. Le montant affiché dessous est la valeur de la ligne.',
  Cours: 'Dernier prix de marché connu, dans la devise sélectionnée.',
  'P/E': 'Prix de l’action rapporté au bénéfice par action des douze derniers mois. Plus bas peut indiquer une valorisation moindre, mais le ratio dépend de la qualité des bénéfices.',
  'P/E Fwd': 'Prix de l’action rapporté au bénéfice par action attendu sur les prochains mois.',
  'P/S': 'Prix rapporté au chiffre d’affaires : capitalisation boursière divisée par le chiffre d’affaires annuel.',
  Yield: 'Rendement annuel du dividende rapporté au cours actuel.',
  Capitalisation: 'Valeur totale des actions cotées de l’entreprise.',
  ROA: 'Rentabilité des actifs : résultat généré par rapport au total des actifs.',
  ROE: 'Rentabilité des capitaux propres : résultat généré par rapport aux fonds propres.',
  PRU: 'Prix de revient unitaire moyen de vos achats, hors impact des ventes.',
  Retour: 'Performance depuis votre prix de revient : montant latent puis pourcentage latent.',
  Variation: 'Variation du cours sur la période sélectionnée. La ligne « Impact » estime sa contribution au portefeuille selon le poids de la position.',
  'Croissance CA (5a)': 'Croissance annuelle moyenne du chiffre d’affaires sur les cinq dernières années disponibles.',
  'ROIC (5a)': 'Rentabilité moyenne du capital investi sur les cinq dernières années disponibles.',
  'PE (5a proxy)': 'P/E indicatif calculé avec le bénéfice par action moyen des cinq dernières années.',
  'PEG CA (5a)': 'P/S rapporté à la croissance moyenne du chiffre d’affaires sur cinq ans. Plus bas peut indiquer une valorisation plus raisonnable, uniquement si la croissance est positive.',
  'PEG BPA (5a)': 'P/E rapporté à la croissance moyenne du bénéfice par action sur cinq ans, proche du PEG classique. Plus bas peut indiquer une valorisation plus raisonnable, uniquement si la croissance est positive.',
  'Linéarité 10a': 'Régularité de la trajectoire du cours sur dix ans. Une valeur élevée indique une progression plus régulière.',
  Secteur: 'Grande catégorie économique de l’entreprise.',
  Industrie: 'Sous-secteur d’activité plus précis.',
  Fondamentaux: 'Indique si des données financières historiques sont disponibles pour cette position.',
}

const HeaderTooltip = ({ title, children }: { title: string; children?: React.ReactNode }) => {
  const description = COLUMN_DESCRIPTIONS[title]
  if (!description) return <>{children || title}</>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`À propos de ${title}`}
        >
          {children || title}
          <Info className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {description}
      </TooltipContent>
    </Tooltip>
  )
}

const FilterButton = ({ column }: FiltrProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="mx-1 p-0" aria-label="Filtrer cette colonne">
        <ListFilterIcon
          className={cn(' h-4 w-4', column?.getFilterValue() != null ? 'text-primary' : '')}
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <Input
        placeholder="filtrer..."
        value={(column?.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
    </DropdownMenuContent>
  </DropdownMenu>
)

const SortingButton = (title: string, activateFilter = true) => {
  return function GhostButton({ column }: FiltrProps) {
    return (
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="gap-1 p-0 capitalize"
              variant="ghost"
              aria-label={`Trier par ${title}. ${COLUMN_DESCRIPTIONS[title] || ''}`}
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              <span>{title}</span>
              <Info className="h-3 w-3 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : null}
              {column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 h-4 w-4" /> : null}
              {!column.getIsSorted() ? <ArrowUpDown className="ml-1 h-4 w-4" /> : null}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
            {COLUMN_DESCRIPTIONS[title] || `Trier par ${title}.`}
          </TooltipContent>
        </Tooltip>

        {activateFilter ? <FilterButton column={column}></FilterButton> : null}
      </div>
    )
  }
}

const formatMultiple = (value: unknown) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? `${round10(numericValue, -2)}x` : '—'
}

const asPercent = (value: unknown) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return null
  return Math.abs(numericValue) <= 1 && numericValue !== 0 ? numericValue * 100 : numericValue
}

const PercentCell = ({ value }: { value: unknown }) => {
  const percent = asPercent(value)
  if (percent == null) return <div className="font-mono tabular-nums text-muted-foreground">—</div>
  return <VariationContainer value={percent} entity="%" background={false} className="m-0 p-0" />
}

const growthAdjustedMultiple = (multiple: unknown, growth: unknown): number | null => {
  const parsedMultiple = Number(multiple)
  const parsedGrowth = Number(growth)
  if (!Number.isFinite(parsedMultiple) || parsedMultiple <= 0) return null
  if (!Number.isFinite(parsedGrowth) || parsedGrowth <= 0) return null

  const growthPercent = Math.abs(parsedGrowth) <= 1 ? parsedGrowth * 100 : parsedGrowth
  return growthPercent > 0 ? parsedMultiple / growthPercent : null
}

const getPeriodVariation = (row: PortfolioSecurity, selectedPeriod?: string): number | undefined => {
  const value = !selectedPeriod || selectedPeriod === '1d'
    ? row.variations?.['1d'] ?? row.dailyVariationPercent ?? row.regularMarketChangePercent
    : row.variations?.[selectedPeriod]

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export const columns = (selectedPeriod?: any, baseCurrency = 'EUR', useNativeCurrency = false, own = true): any[] => {
  const colList: any[] = [
    {
      accessorKey: 'symbol',
      header: SortingButton(own ? 'Produit x Quantité' : 'Produit'),
      cell: ({ row }) => {
        const symbol = row.getValue('symbol') as string

        return (
          <div className="flex max-w-[110px] sm:max-w-[160px] md:max-w-[220px] min-w-0 items-center gap-1.5 overflow-hidden">
            <img
              className="h-5 w-5 shrink-0 rounded-full bg-white/10 p-0.5 ring-1 ring-white/20"
              src={`https://financialmodelingprep.com/image-stock/${row.original.symbol.toLocaleUpperCase()}.png`}
              alt={row.original.symbol}
            />
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="truncate text-xs font-semibold flex items-center gap-1">
                <span className="truncate">{symbol} {own && row.original.qty ? `x ${row.original.qty}` : ''}</span>
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {row.original.shortname || ''}
              </span>
            </div>
          </div>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: 'weight',
      header: SortingButton('Poids', false),
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        return (
          <div className="flex flex-col">
            <div className="font-medium">
              {round10((row.getValue('weight') as number) * 100, -1)}%
            </div>
            {own && row.original.totalValue != null && row.original.qty !== 0 && (
              <div className="text-muted-foreground">{round10(row.original.totalValue, -2).toLocaleString() + ' ' + symbol}</div>
            )}
          </div>
        )
      },
      enableHiding: true,
    },
    {
      accessorFn: (row) => row.last,
      id: 'regularMarketPrice',
      header: SortingButton('Cours', false),
      cell: ({ row }) => {
        const last = parseFloat(row.getValue('regularMarketPrice'))
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const formatted = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: currencyToUse,
        }).format(last)
        return <div className="font-medium">{formatted}</div>
      },
      enableHiding: true,
    },
    {
      accessorKey: 'trailingPE',
      header: SortingButton('P/E'),
      cell: ({ row }) => <div className="font-mono tabular-nums">{formatMultiple(row.getValue('trailingPE'))}</div>,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'forwardPE',
      header: SortingButton('P/E Fwd'),
      cell: ({ row }) => <div className="font-mono tabular-nums">{formatMultiple(row.getValue('forwardPE'))}</div>,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'priceToSales',
      header: SortingButton('P/S'),
      cell: ({ row }) => <div className="font-mono tabular-nums">{formatMultiple(row.getValue('priceToSales'))}</div>,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'dividendYield',
      header: SortingButton('Yield'),
      cell: ({ row }) => <PercentCell value={row.getValue('dividendYield')} />,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'marketCap',
      header: SortingButton('Capitalisation'),
      cell: ({ row }) => {
        const value = Number(row.getValue('marketCap'))
        if (!Number.isFinite(value) || value <= 0) return <div className="font-mono tabular-nums text-muted-foreground">—</div>
        return <div className="font-mono tabular-nums">{new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}</div>
      },
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'roa',
      header: SortingButton('ROA'),
      cell: ({ row }) => <PercentCell value={row.getValue('roa')} />,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'roe',
      header: SortingButton('ROE'),
      cell: ({ row }) => <PercentCell value={row.getValue('roe')} />,
      filterFn: genericNumericFilterFn,
    },
  ]

  if (own) {
    colList.push({
      accessorKey: 'bep',
      header: <HeaderTooltip title="PRU" />,
      cell: ({ row }) => {
        const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
        const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
        const bepVal = useNativeCurrency && row.original.nativeBep != null ? row.original.nativeBep : row.getValue('bep')
        return (
          <div className="font-medium">{row.original.qty === 0 || bepVal == null ? '-' : round10(bepVal as number, -2).toLocaleString() + ' ' + symbol}</div>
        )
      },
      enableHiding: true,
    })
  }

  colList.push({
    accessorKey: 'variationPercent',
    header: SortingButton('Retour', false),
    cell: ({ row }) => {
      const currencyToUse = useNativeCurrency && row.original.currency ? row.original.currency : baseCurrency
      const symbol = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyToUse }).formatToParts(0).find(p => p.type === 'currency')?.value || '€'
      
      let varValue = row!.original.variation
      let varPercent = row!.original.variationPercent
      
      return (
        <div className="flex flex-col gap-1">
          {own && varValue != null && row.original.qty !== 0 && (
            <VariationContainer
              value={varValue}
              background={false}
              entity={symbol}
              className="m-0 p-0"
            />
          )}
          {varPercent != null && (
            <VariationContainer
              value={varPercent}
              background={false}
              className="m-0 p-0"
            />
          )}
        </div>
      )
    },
    enableHiding: true,
  })
  colList.push(
    {
      accessorFn: (row) => {
        return getPeriodVariation(row, selectedPeriod)
      },
      id: 'variation',
      header: SortingButton('Variation', false),
      cell: ({ row }) => {
        const chg = getPeriodVariation(row.original, selectedPeriod)
        const portfolioImpact = chg != null && Number.isFinite(row.original.weight)
          ? chg * row.original.weight
          : undefined

        return (
          <div className="flex min-w-[92px] flex-col gap-0.5">
            {chg == null ? (
              <span className="font-mono text-xs text-muted-foreground">—</span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-medium uppercase text-muted-foreground">Cours</span>
                <VariationContainer
                  value={chg}
                  entity="%"
                  background={false}
                  className="m-0 p-0"
                />
              </div>
            )}
            {own && portfolioImpact != null && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-medium uppercase text-muted-foreground">Impact</span>
                <VariationContainer
                  value={portfolioImpact}
                  entity="%"
                  background={false}
                  className="m-0 p-0 text-[10px]"
                />
              </div>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const varA = getPeriodVariation(rowA.original, selectedPeriod)
        const varB = getPeriodVariation(rowB.original, selectedPeriod)
        if (varA == null && varB == null) return 0
        if (varA == null) return 1
        if (varB == null) return -1
        return varA - varB
      },
      sortUndefined: 'last',
    },
    {
      accessorFn: (row) => row.qualityMetrics?.revenueGrowth5yAvg,
      id: 'revGrowth',
      header: SortingButton('Croissance CA (5a)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.revenueGrowth5yAvg
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0" />
      },
    },
    {
      accessorFn: (row) => row.qualityMetrics?.roic5yAvg,
      id: 'roic',
      header: SortingButton('ROIC (5a)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.roic5yAvg
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <VariationContainer value={val * 100} entity="%" background={false} className="m-0 p-0" />
      },
    },
    {
      accessorFn: (row) => row.qualityMetrics?.pe5yAvgProxy,
      id: 'pe5y',
      header: SortingButton('PE (5a proxy)'),
      cell: ({ row }) => {
        const val = row.original.qualityMetrics?.pe5yAvgProxy
        if (val == null) return <div className="text-muted-foreground">-</div>
        return <div className="font-medium">{val.toFixed(1)}x</div>
      },
    },
    {
      accessorFn: (row) => growthAdjustedMultiple(row.priceToSales, row.qualityMetrics?.revenueGrowth5yAvg),
      id: 'psGrowth5y',
      header: SortingButton('PEG CA (5a)'),
      cell: ({ row }) => {
        const val = growthAdjustedMultiple(row.original.priceToSales, row.original.qualityMetrics?.revenueGrowth5yAvg)
        return val == null ? <div className="text-muted-foreground">—</div> : <div className="font-medium">{val.toFixed(1)}x</div>
      },
      filterFn: genericNumericFilterFn,
    },
    {
      accessorFn: (row) => growthAdjustedMultiple(row.trailingPE, row.qualityMetrics?.epsGrowth5yAvg),
      id: 'peg5y',
      header: SortingButton('PEG BPA (5a)'),
      cell: ({ row }) => {
        const val = growthAdjustedMultiple(row.original.trailingPE, row.original.qualityMetrics?.epsGrowth5yAvg)
        return val == null ? <div className="text-muted-foreground">—</div> : <div className="font-medium">{val.toFixed(1)}x</div>
      },
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'linearity10y',
      header: SortingButton('Linéarité 10a'),
      cell: ({ row }) => <PercentCell value={row.getValue('linearity10y')} />,
      filterFn: genericNumericFilterFn,
    },
    {
      accessorKey: 'sector',
      header: SortingButton('Secteur'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('sector') || '—'}</div>,
    },
    {
      accessorKey: 'industry',
      header: SortingButton('Industrie'),
      cell: ({ row }) => <div className="capitalize">{row.getValue('industry') || '—'}</div>,
    },
    {
      accessorFn: (row) => row.qualityMetrics?.hasFundamentals ? 'yes' : 'no',
      id: 'hasFundamentals',
      header: SortingButton('Fondamentaux'),
      cell: ({ row }) => row.original.qualityMetrics?.hasFundamentals
        ? <div className="font-medium text-emerald-600 dark:text-emerald-400">Dispo</div>
        : <div className="text-muted-foreground">—</div>,
    }
  )

  return colList
}
