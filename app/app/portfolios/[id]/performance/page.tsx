'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PerformanceBox from './performanceBox'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
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
      // Call backend recalculation init performance endpoint
      await initPerformance(id)
      
      // Invalidate IndexedDB caches for this portfolio to force risk metrics recalculation
      const cacheKey1Y = `risk-v2-${id}-1Y-${selectedBenchmarks.join(',')}`;
      const cacheKey3Y = `risk-v2-${id}-3Y-${selectedBenchmarks.join(',')}`;
      const cacheKeyNoBench1Y = `risk-v2-${id}-1Y-`;
      const cacheKeyNoBench3Y = `risk-v2-${id}-3Y-`;
      await Promise.all([
        deleteCache(cacheKey1Y),
        deleteCache(cacheKey3Y),
        deleteCache(cacheKeyNoBench1Y),
        deleteCache(cacheKeyNoBench3Y)
      ]);
      
      // Trigger local React component updates by incrementing key
      setRefreshKey((prev) => prev + 1)
    } catch (e) {
      console.error('Failed to recalculate performance', e)
    } finally {
      setRecalculating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionContainer className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Analyse de Performance</h2>
            <p className="text-sm text-muted-foreground">Suivi des performances et indicateurs de risque</p>
          </div>
          <Button
            onClick={handleRecalculate}
            disabled={recalculating}
            variant="outline"
            className="flex items-center gap-2 rounded-full border-border/50 bg-background hover:bg-accent/50 w-fit h-9"
          >
            <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalcul...' : 'Recalculer les performances'}</span>
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer className="w-full">
        <RiskQuickStats metrics={metrics} loading={loading} period={period} />
      </SectionContainer>

      <SectionContainer className="w-full">
        <PerformanceBox
          key={`box-${refreshKey}`}
          id={id}
          selectedBenchmarks={selectedBenchmarks}
          onAddBenchmark={handleAddBenchmark}
          onRemoveBenchmark={handleRemoveBenchmark}
          period={period}
          onPeriodChange={setPeriod}
        />
      </SectionContainer>

      <SectionContainer className="w-full">
        <RiskAnalysisCard metrics={metrics} loading={loading} period={period} />
      </SectionContainer>

      <SectionContainer className="w-full">
        <YearlyOverview key={`overview-${refreshKey}`} id={id} selectedBenchmarks={selectedBenchmarks} />
      </SectionContainer>
    </div>
  )
}

export default PagePerformance
