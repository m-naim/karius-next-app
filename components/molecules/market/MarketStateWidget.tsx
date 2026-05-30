'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, TrendingDown, Zap, ShieldAlert, ZapOff } from 'lucide-react'
import { getStockHistory } from '@/services/stock.service'
import { Skeleton } from '@/components/ui/skeleton'

export function MarketStateWidget() {
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral')
  const [volatility, setVolatility] = useState<'Low' | 'High' | 'Extreme'>('Low')
  const [trendValue, setTrendValue] = useState(0)
  const [vixValue, setVixValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyData = await getStockHistory(['SPY', '^VIX'], '1m')
        
        // Compute Trend (SPY performance over the last month)
        const spyHistory = historyData['SPY'] || []
        if (spyHistory.length > 1) {
          const first = spyHistory[0].close
          const last = spyHistory[spyHistory.length - 1].close
          const perf = ((last - first) / first) * 100
          setTrendValue(perf)
          if (perf > 1) setTrend('Bullish')
          else if (perf < -1) setTrend('Bearish')
          else setTrend('Neutral')
        }

        // Compute Volatility (Current VIX value)
        const vixHistory = historyData['^VIX'] || []
        if (vixHistory.length > 0) {
          const currentVix = vixHistory[vixHistory.length - 1].close
          setVixValue(currentVix)
          if (currentVix > 30) setVolatility('Extreme')
          else if (currentVix > 20) setVolatility('High')
          else setVolatility('Low')
        }

      } catch (error) {
        console.error('Failed to fetch market state', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />
  }

  const getTrendColor = () => {
    if (trend === 'Bullish') return 'text-green-500'
    if (trend === 'Bearish') return 'text-red-500'
    return 'text-gray-500'
  }

  const getVolColor = () => {
    if (volatility === 'Extreme') return 'text-red-500'
    if (volatility === 'High') return 'text-orange-500'
    return 'text-yellow-500'
  }

  return (
    <Card className="border-none bg-primary/5 shadow-none lg:col-span-2">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Activity size={20} />
        </div>
        <CardTitle className="text-xl font-bold">État du Marché (Temps Réel)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-gray-600">
          Ce résumé est calculé dynamiquement. La <strong>tendance</strong> reflète la performance du S&P 500 sur le dernier mois ({trendValue > 0 ? '+' : ''}{trendValue.toFixed(2)}%), tandis que la <strong>volatilité</strong> est mesurée par l'indice VIX ({vixValue.toFixed(2)}). 
          {trend === 'Bullish' && volatility === 'Low' && " Un marché haussier avec une faible volatilité suggère une forte confiance des investisseurs."}
          {trend === 'Bearish' && volatility === 'High' && " Une forte volatilité couplée à une tendance baissière indique un environnement de marché incertain ou craintif."}
          {trend === 'Bullish' && volatility === 'High' && " Le marché monte mais reste très volatil, restez prudent face aux mouvements brusques."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
            {volatility === 'Extreme' ? <ShieldAlert className={`h-4 w-4 ${getVolColor()}`} /> : <Zap className={`h-4 w-4 ${getVolColor()}`} />}
            <span>Volatilité (VIX): {volatility}</span>
            <span className="ml-1 text-[10px] text-gray-400">({vixValue.toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
            {trend === 'Bullish' ? <TrendingUp className={`h-4 w-4 ${getTrendColor()}`} /> : <TrendingDown className={`h-4 w-4 ${getTrendColor()}`} />}
            <span>Tendance: {trend}</span>
            <span className="ml-1 text-[10px] text-gray-400">({trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
