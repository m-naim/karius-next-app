'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import PerformanceBox from './performanceBox'
import YearlyOverview from './yearlyOverview'
import { validateBenchmark } from './components/BenchmarkSelector'
import { useRiskMetrics } from '@/hooks/useRiskMetrics'
import { initPerformance } from '@/services/portfolioService'
import { deleteCache } from '@/lib/idb-cache'
import RiskQuickStats from './components/RiskQuickStats'
import RiskAnalysisCard from './components/RiskAnalysisCard'
import { Activity, Clock3 } from 'lucide-react'

function PagePerformance() {
  const id = usePathname().split('/')[3]
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [period, setPeriod] = useState<string>('1M')
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [recalculating, setRecalculating] = useState<boolean>(false)

  const { metrics, loading } = useRiskMetrics(id, period, selectedBenchmarks, refreshKey)
  const hasRiskAnalysis = period === '1Y' || period === '3Y'

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
      setRecalculating(true)
      await initPerformance(id)

      const cacheKey1Y = `risk-v2-${id}-1Y-${selectedBenchmarks.join(',')}`
      const cacheKey3Y = `risk-v2-${id}-3Y-${selectedBenchmarks.join(',')}`
      const cacheKeyNoBench1Y = `risk-v2-${id}-1Y-`
      const cacheKeyNoBench3Y = `risk-v2-${id}-3Y-`
      await Promise.all([
        deleteCache(cacheKey1Y),
        deleteCache(cacheKey3Y),
        deleteCache(cacheKeyNoBench1Y),
        deleteCache(cacheKeyNoBench3Y),
      ])

      setRefreshKey((prev) => prev + 1)
    } catch (e) {
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

      <RiskQuickStats
        metrics={metrics}
        loading={loading}
        period={period}
        onRecalculate={handleRecalculate}
        recalculating={recalculating}
      />

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <div className={`min-w-0 ${hasRiskAnalysis ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <PerformanceBox
            key={`box-${refreshKey}`}
            id={id}
            selectedBenchmarks={selectedBenchmarks}
            onAddBenchmark={handleAddBenchmark}
            onRemoveBenchmark={handleRemoveBenchmark}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        {hasRiskAnalysis && (
          <div className="min-w-0 lg:col-span-4">
            <RiskAnalysisCard metrics={metrics} loading={loading} period={period} />
          </div>
        )}
      </div>

      <YearlyOverview key={`overview-${refreshKey}`} id={id} selectedBenchmarks={selectedBenchmarks} />
    </div>
  )
}

export default PagePerformance
