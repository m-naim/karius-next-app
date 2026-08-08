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

function PagePerformance() {
  const id = usePathname().split('/')[3]
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [period, setPeriod] = useState<string>('1M')
  const [refreshKey, setRefreshKey] = useState<number>(0)
  const [recalculating, setRecalculating] = useState<boolean>(false)

  const { metrics, loading } = useRiskMetrics(id, period, selectedBenchmarks, refreshKey)

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
    <div className="flex flex-col gap-4 w-full pb-6">
      {/* 1. Quick Metrics Bar + Recalculate Button */}
      <RiskQuickStats
        metrics={metrics}
        loading={loading}
        period={period}
        onRecalculate={handleRecalculate}
        recalculating={recalculating}
      />

      {/* 2. Main Dense Split Layout (8-col chart / 4-col analytics) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Main Performance Chart */}
        <div className="lg:col-span-8 space-y-4">
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

        {/* Right Column: Risk Analysis & Yearly Overview */}
        <div className="lg:col-span-4 space-y-4">
          <RiskAnalysisCard metrics={metrics} loading={loading} period={period} />
          <YearlyOverview key={`overview-${refreshKey}`} id={id} selectedBenchmarks={selectedBenchmarks} />
        </div>
      </div>
    </div>
  )
}

export default PagePerformance
