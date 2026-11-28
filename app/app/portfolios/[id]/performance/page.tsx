'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import PerformanceBox from './performanceBox'
import YearlyOverview from './yearlyOverview'
import { validateBenchmark } from './components/BenchmarkSelector'
import { useRiskMetrics } from '@/hooks/useRiskMetrics'
import { initPerformance } from '@/services/portfolioService'
import { HttpError } from '@/services/http'
import RiskQuickStats from './components/RiskQuickStats'
import { Activity, Clock3 } from 'lucide-react'

function PagePerformance() {
  const id = usePathname().split('/')[3]
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [period, setPeriod] = useState<string>('1M')
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [recalculating, setRecalculating] = useState<boolean>(false)
  const [recalculationError, setRecalculationError] = useState<string | null>(null)

  const [riskYears, setRiskYears] = useState<1 | 3>(1)
  const [riskRetry, setRiskRetry] = useState(0)
  const { metrics, loading, error } = useRiskMetrics(id, riskYears, selectedBenchmarks, refreshKey + riskRetry)


  const handleAddBenchmark = (benchmark: string) => {
    if (!validateBenchmark(benchmark)) return
    if (selectedBenchmarks.includes(benchmark)) return
    setSelectedBenchmarks([...selectedBenchmarks, benchmark])
  }

  const handleRemoveBenchmark = (benchmark: string) => {
    setSelectedBenchmarks(selectedBenchmarks.filter((b) => b !== benchmark))
  }

  const handleRecalculate = async () => {
    try {
      setRecalculationError(null)
      setRecalculating(true)
      await initPerformance(id)

      setRefreshKey((prev) => prev + 1)
    } catch (e) {
      if (e instanceof HttpError && e.status === 503 && e.data?.message?.startsWith('Taux de change indisponible')) {
        setRecalculationError(`${e.message}. Les performances déjà enregistrées restent disponibles.`)
      } else {
        setRecalculationError('Le recalcul a échoué. Les derniers résultats restent affichés.')
      }
      console.error('Failed to recalculate performance', e)
    } finally {
      setRecalculating(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <Activity className="h-3.5 w-3.5" />
            Suivi du portefeuille
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Performance & risque
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Comprenez l’évolution de votre portefeuille et le niveau de risque pris sur chaque période.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:self-end">
          <Clock3 className="h-3.5 w-3.5" />
          Données historiques
        </div>
      </div>

      {recalculationError && (
        <p role="alert" className="text-sm text-destructive">{recalculationError}</p>
      )}

      <RiskQuickStats metrics={metrics} loading={loading} error={error}
        years={riskYears} onYearsChange={setRiskYears}
        onRecalculate={handleRecalculate} recalculating={recalculating}
        onRetry={() => setRiskRetry((value) => value + 1)} />

      <PerformanceBox
        key={`box-${refreshKey}`}
        id={id}
        selectedBenchmarks={selectedBenchmarks}
        onAddBenchmark={handleAddBenchmark}
        onRemoveBenchmark={handleRemoveBenchmark}
        period={period}
        onPeriodChange={setPeriod}
      />

      <YearlyOverview key={`overview-${refreshKey}`} id={id} selectedBenchmarks={selectedBenchmarks} />
    </div>
  )
}

export default PagePerformance
