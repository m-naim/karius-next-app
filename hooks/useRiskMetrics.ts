import { useEffect, useState } from 'react'
import { getPortfolioRisk } from '@/services/portfolioService'

export interface RiskSnapshot {
  asOf: string | null
  calculatedAt?: string | null
  sharpe: number | null
  sortino: number | null
  maxDrawdown: number | null
  volatility: number | null
  status: 'READY' | 'INSUFFICIENT_HISTORY' | 'REFERENCE_UNAVAILABLE' | 'ZERO_VOLATILITY'
}

export interface PortfolioRiskResult {
  snapshot: RiskSnapshot
  currency: string
  reference: string | null
  benchmarks: Record<string, {
    beta: number | null
    volatility: number | null
    maxDrawdown: number | null
    sharpe: number | null
    sortino: number | null
  }>
}

export const riskNumber = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})
const riskPercent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 })

export function formatRisk(value: number | null | undefined, percent = false) {
  return value == null ? '—' : (percent ? riskPercent : riskNumber).format(value)
}

export const riskStatusMessage = {
  READY: '',
  INSUFFICIENT_HISTORY: 'Historique insuffisant pour cette période.',
  REFERENCE_UNAVAILABLE: 'Taux de référence indisponible pour le Sharpe et le Sortino.',
  ZERO_VOLATILITY: 'Volatilité nulle. Sharpe indisponible.',
}

export function useRiskMetrics(id: string, years: 1 | 3, benchmarks: string[], refreshKey: number) {
  const key = benchmarks.join(',')
  const [result, setResult] = useState<{ id: string; years: number; data: PortfolioRiskResult }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    getPortfolioRisk(id, years, key, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ id, years, data })
    }).catch(() => {
      if (!controller.signal.aborted) setError(true)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [id, years, key, refreshKey])

  return { metrics: result?.id === id && result.years === years ? result.data : undefined, loading, error }
}
