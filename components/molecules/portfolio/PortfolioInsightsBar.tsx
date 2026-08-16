'use client'

import React, { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Coins,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react'

export interface PortfolioSecurity {
  symbol: string
  name?: string
  weight?: number
  value?: number
  variation?: number
  variationPercent?: number
  [key: string]: any
}

import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { round10 } from '@/lib/decimalAjustement'

interface PortfolioInsightsBarProps {
  portfolio: {
    totalValue?: number
    cashValue?: number
    baseCurrency?: string
  }
  securities: PortfolioSecurity[]
  selectedPeriod?: string
}

export function PortfolioInsightsBar({
  portfolio,
  securities = [],
  selectedPeriod = '1d',
}: PortfolioInsightsBarProps) {
  const currencySymbol = useMemo(() => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: portfolio?.baseCurrency || 'EUR',
      })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value || '€'
    )
  }, [portfolio?.baseCurrency])

  const insights = useMemo(() => {
    if (!securities || securities.length === 0) return null

    // 1. Sort securities by day variation
    const validSecurities = securities.filter(
      (s) => s.variation != null || s.variationPercent != null
    )
    const sortedByVariation = [...validSecurities].sort((a, b) => {
      const varA = a.variationPercent ?? a.variation ?? 0
      const varB = b.variationPercent ?? b.variation ?? 0
      return varB - varA
    })

    const topWinner = sortedByVariation[0]
    const topLoser = sortedByVariation[sortedByVariation.length - 1]

    // 2. Concentration risk: Find max weight
    const totalValue = portfolio?.totalValue || 0
    let maxWeight = 0
    let heaviestSymbol = ''

    securities.forEach((s) => {
      const weight = s.weight != null ? s.weight : totalValue > 0 ? ((s.value || 0) / totalValue) * 100 : 0
      if (weight > maxWeight) {
        maxWeight = weight
        heaviestSymbol = s.symbol
      }
    })

    // 3. Cash Weight
    const cashValue = portfolio?.cashValue || 0
    const cashPercent = totalValue > 0 ? (cashValue / totalValue) * 100 : 0

    return {
      topWinner: topWinner && (topWinner.variationPercent ?? topWinner.variation ?? 0) > 0 ? topWinner : null,
      topLoser: topLoser && (topLoser.variationPercent ?? topLoser.variation ?? 0) < 0 ? topLoser : null,
      heaviestSymbol,
      maxWeight: round10(maxWeight, -1),
      isHighConcentration: maxWeight > 25,
      cashPercent: round10(cashPercent, -1),
      cashValue: round10(cashValue, -2),
      holdingsCount: securities.length,
    }
  }, [securities, portfolio])

  if (!insights) return null

  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
      {/* 1. Alerte Concentration (Si > 25 %) */}
      {insights.isHighConcentration && (
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-600 dark:text-amber-400 font-bold shrink-0">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>
            Forte concentration : {insights.heaviestSymbol} ({insights.maxWeight}%)
          </span>
        </div>
      )}

      {/* 2. Top Gagnant du jour */}
      {insights.topWinner && (
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-foreground shrink-0">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-bold">{insights.topWinner.symbol}</span>
          <VariationContainer
            value={insights.topWinner.variationPercent ?? insights.topWinner.variation ?? 0}
            entity="%"
            className="p-0 text-xs font-bold"
            background={false}
          />
        </div>
      )}

      {/* 3. Top Baisse du jour */}
      {insights.topLoser && (
        <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 text-foreground shrink-0">
          <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          <span className="font-bold">{insights.topLoser.symbol}</span>
          <VariationContainer
            value={insights.topLoser.variationPercent ?? insights.topLoser.variation ?? 0}
            entity="%"
            className="p-0 text-xs font-bold"
            background={false}
          />
        </div>
      )}

      {/* 4. Ratio Liquidités (Cash) */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-muted-foreground shrink-0">
        <Coins className="h-3.5 w-3.5 text-primary" />
        <span>Liquidités :</span>
        <span className="font-bold text-foreground tabular-nums">
          {insights.cashPercent}% ({insights.cashValue.toLocaleString()} {currencySymbol})
        </span>
      </div>

      {/* 5. Lignes Actives */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-muted-foreground shrink-0">
        <Layers className="h-3.5 w-3.5" />
        <span>Positions :</span>
        <span className="font-bold text-foreground tabular-nums">
          {insights.holdingsCount}
        </span>
      </div>
    </div>
  )
}
