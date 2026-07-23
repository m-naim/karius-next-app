'use client'

import React, { useMemo } from 'react'
import { PortfolioSecurity } from './columns'
import { RightSidebar } from '@/components/organismes/layout/RightSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { round10 } from '@/lib/decimalAjustement'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Calendar,
  Sparkles,
  Scale,
  History,
  LineChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Imports des composants d'analyse partagés avec Watchlist
import { TickerChart } from '../../watchlist/[id]/components/TickerChart'
import { FundamentalChart } from '../../watchlist/[id]/components/FundamentalChart'
import { PerHistoryChart } from '../../watchlist/[id]/components/PerHistoryChart'

interface PortfolioAssetDrawerProps {
  isOpen: boolean
  onClose: () => void
  security: PortfolioSecurity | null
  portfolio: any
}

export default function PortfolioAssetDrawer({
  isOpen,
  onClose,
  security,
  portfolio,
}: PortfolioAssetDrawerProps) {
  if (!security) return null

  const currencySymbol = useMemo(() => {
    const curr = security.currency || portfolio?.baseCurrency || 'EUR'
    return (
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value || '€'
    )
  }, [security, portfolio])

  const formatMoney = (val: number) => {
    if (val == null || isNaN(val)) return `- ${currencySymbol}`
    return `${round10(val, -2).toLocaleString('fr-FR')} ${currencySymbol}`
  }

  // Filtrer les transactions pour cet actif
  const assetTransactions = useMemo(() => {
    if (!portfolio?.transactions) return []
    return portfolio.transactions
      .filter((t: any) => t.symbol === security.symbol || t.ticker === security.symbol)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [portfolio, security])

  // Filtrer uniquement les achats
  const buyTransactions = useMemo(() => {
    return assetTransactions.filter((t: any) => t.qty > 0)
  }, [assetTransactions])

  // Métriques avancées sur chacun des achats
  const purchaseMetrics = useMemo(() => {
    if (buyTransactions.length === 0) return null

    const currentPrice = security.last || 0

    const analyzedBuys = buyTransactions.map((tx: any) => {
      const buyPrice = tx.price || 0
      const qty = tx.qty || 0
      const totalCost = buyPrice * qty
      const currentValue = currentPrice * qty
      const gainLoss = currentValue - totalCost
      const gainPercent = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0

      return {
        ...tx,
        buyPrice,
        qty,
        totalCost,
        currentValue,
        gainLoss,
        gainPercent,
      }
    })

    const bestBuy = [...analyzedBuys].sort((a, b) => b.gainPercent - a.gainPercent)[0]
    const worstBuy = [...analyzedBuys].sort((a, b) => a.gainPercent - b.gainPercent)[0]
    const latestBuy = analyzedBuys[0]

    const buyPrices = analyzedBuys.map((b) => b.buyPrice)
    const minBuyPrice = Math.min(...buyPrices)
    const maxBuyPrice = Math.max(...buyPrices)
    const totalInvestedInBuys = analyzedBuys.reduce((sum, b) => sum + b.totalCost, 0)
    const totalBoughtQty = analyzedBuys.reduce((sum, b) => sum + b.qty, 0)

    const pru = security.bep || 0
    const pruVsCurrentPercent = pru > 0 ? ((currentPrice - pru) / pru) * 100 : 0
    const globalGainLoss = (currentPrice - pru) * security.qty

    return {
      analyzedBuys,
      bestBuy,
      worstBuy,
      latestBuy,
      minBuyPrice,
      maxBuyPrice,
      totalInvestedInBuys,
      totalBoughtQty,
      pru,
      pruVsCurrentPercent,
      globalGainLoss,
      currentPrice,
    }
  }, [buyTransactions, security])

  const totalReturnPercent = security.bep
    ? ((security.last - security.bep) / security.bep) * 100
    : 0

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      width="md:w-[580px] lg:w-[680px]"
      title={
        <div className="flex items-center gap-3">
          <img
            src={`https://financialmodelingprep.com/image-stock/${security.symbol.toUpperCase()}.png`}
            alt={security.symbol}
            className="h-8 w-8 rounded-full bg-background border p-0.5 object-contain"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight">{security.symbol}</span>
              {security.currency && (
                <Badge variant="outline" className="text-[10px] py-0 h-4">
                  {security.currency}
                </Badge>
              )}
            </div>
            <span className="text-xs font-normal text-muted-foreground truncate max-w-[280px]">
              {security.shortname || security.sector || 'Fiche Détaillée d\'Actif'}
            </span>
          </div>
        </div>
      }
    >
      <Tabs defaultValue="achats" className="flex h-full flex-col min-h-0">
        <div className="border-b bg-muted/20 px-4 py-2 shrink-0">
          <TabsList className="grid w-full grid-cols-4 h-9 bg-muted/60 p-1">
            <TabsTrigger value="achats" className="text-xs font-bold gap-1.5 px-2">
              <ShoppingBag className="h-3.5 w-3.5" />
              Mes Achats
            </TabsTrigger>
            <TabsTrigger value="technical" className="text-xs font-bold gap-1.5 px-2">
              <LineChart className="h-3.5 w-3.5" />
              Technique
            </TabsTrigger>
            <TabsTrigger value="fundamental" className="text-xs font-bold gap-1.5 px-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Fondamental
            </TabsTrigger>
            <TabsTrigger value="valorisation" className="text-xs font-bold gap-1.5 px-2">
              <Scale className="h-3.5 w-3.5" />
              Valorisation
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: ACHATS & SYNTHÈSE DES POSITIONS */}
        <TabsContent value="achats" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
          {/* CARTE DE SYNTHÈSE GLOBALE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card border rounded-xl p-3 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">Cours Actuel</span>
              <div className="text-base font-bold tabular-nums">{formatMoney(security.last)}</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">PRU Moyen</span>
              <div className="text-base font-bold tabular-nums">{formatMoney(security.bep)}</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">Valeur Totale</span>
              <div className="text-base font-bold tabular-nums">{formatMoney(security.totalValue)}</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-muted-foreground">Retour Global</span>
              <VariationContainer
                value={totalReturnPercent}
                background={true}
                className="text-xs font-bold py-0.5 px-2 w-fit"
              />
            </div>
          </div>

          {/* SECTION INDICES & METRIQUES CHACUN DES ACHATS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Indices & Analyse de vos Achats ({buyTransactions.length})
              </h3>
              {purchaseMetrics && (
                <Badge variant="secondary" className="text-[10px]">
                  {purchaseMetrics.totalBoughtQty} actions achetées au total
                </Badge>
              )}
            </div>

            {purchaseMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Meilleur Achat */}
                {purchaseMetrics.bestBuy && (
                  <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-none">
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Meilleur Point d'Entrée
                        </span>
                        <span className="font-bold">
                          +{round10(purchaseMetrics.bestBuy.gainPercent, -2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-sm font-extrabold tabular-nums">
                            {formatMoney(purchaseMetrics.bestBuy.buyPrice)}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(purchaseMetrics.bestBuy.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-right text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          {purchaseMetrics.bestBuy.qty} unit. ({formatMoney(purchaseMetrics.bestBuy.totalCost)})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Moins Bon Achat */}
                {purchaseMetrics.worstBuy && (
                  <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5" />
                          Achat le Moins Performant
                        </span>
                        <span className="font-bold">
                          {round10(purchaseMetrics.worstBuy.gainPercent, -2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-sm font-extrabold tabular-nums">
                            {formatMoney(purchaseMetrics.worstBuy.buyPrice)}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(purchaseMetrics.worstBuy.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="text-right text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          {purchaseMetrics.worstBuy.qty} unit. ({formatMoney(purchaseMetrics.worstBuy.totalCost)})
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fourchette des Prix d'Achat */}
                <Card className="border-border bg-card/50 shadow-none sm:col-span-2">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Scale className="h-3.5 w-3.5 text-primary" />
                        Dispersion des Prix d'Achat (Min vs Max)
                      </span>
                      <span className="tabular-nums font-semibold text-foreground">
                        PRU : {formatMoney(security.bep)}
                      </span>
                    </div>

                    <div className="relative pt-2 pb-1">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full" />
                      </div>
                      <div className="flex justify-between items-center text-[11px] mt-1.5">
                        <span className="text-emerald-500 font-semibold">
                          Achat Min: {formatMoney(purchaseMetrics.minBuyPrice)}
                        </span>
                        <span className="text-muted-foreground">
                          Écart: {round10(((purchaseMetrics.maxBuyPrice - purchaseMetrics.minBuyPrice) / purchaseMetrics.minBuyPrice) * 100, -1)}%
                        </span>
                        <span className="text-rose-500 font-semibold">
                          Achat Max: {formatMoney(purchaseMetrics.maxBuyPrice)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic p-3 border rounded-lg bg-muted/20">
                Aucun achat enregistré pour cette position.
              </div>
            )}
          </div>

          {/* LISTE DES ACHATS ET MOULINET DES TRANSACTIONS EN BAS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" />
                Historique détaillé des Achats / Ventes ({assetTransactions.length})
              </h3>
            </div>

            {purchaseMetrics?.analyzedBuys && purchaseMetrics.analyzedBuys.length > 0 ? (
              <div className="space-y-2">
                {purchaseMetrics.analyzedBuys.map((tx: any, index: number) => {
                  const isProfit = tx.gainPercent >= 0
                  return (
                    <div
                      key={tx.id || index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            tx.qty > 0
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          )}
                        >
                          {tx.qty > 0 ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">
                              {tx.qty > 0 ? 'Achat' : 'Vente'} #{purchaseMetrics.analyzedBuys.length - index}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {tx.qty} actions @ {formatMoney(tx.buyPrice)}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(tx.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold tabular-nums">
                          {formatMoney(tx.totalCost)}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">Performance :</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0 font-bold border-none',
                              isProfit
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            )}
                          >
                            {isProfit ? '+' : ''}
                            {round10(tx.gainPercent, -2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Aucune transaction trouvée pour cet actif.
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: TECHNIQUE (Graphique historique avec marqueurs d'achats/ventes, benchmarks, CAGR, DD, etc.) */}
        <TabsContent value="technical" className="flex-1 overflow-y-auto m-0 p-0">
          <TickerChart symbol={security.symbol} transactions={assetTransactions} />
        </TabsContent>

        {/* TAB 3: FONDAMENTAL (Données financières, CA, Marges, EPS...) */}
        <TabsContent value="fundamental" className="flex-1 overflow-y-auto p-4 m-0">
          <FundamentalChart symbol={security.symbol} />
        </TabsContent>

        {/* TAB 4: VALORISATION (PER Historique...) */}
        <TabsContent value="valorisation" className="flex-1 overflow-y-auto p-4 m-0">
          <PerHistoryChart symbol={security.symbol} />
        </TabsContent>
      </Tabs>
    </RightSidebar>
  )
}
