'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import PerformanceBox from './performanceBox'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import YearlyOverview from './yearlyOverview'
import { validateBenchmark } from './components/BenchmarkSelector'
import { useRiskMetrics } from '@/hooks/useRiskMetrics'
import RiskQuickStats from './components/RiskQuickStats'
import RiskAnalysisCard from './components/RiskAnalysisCard'

function PagePerformance() {
  const id = usePathname().split('/')[3]
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [period, setPeriod] = useState<string>('1M')
  const { metrics, loading } = useRiskMetrics(id, period, selectedBenchmarks)

  const handleAddBenchmark = (benchmark: string) => {
    if (!validateBenchmark(benchmark)) return
    if (selectedBenchmarks.includes(benchmark)) return
    setSelectedBenchmarks([...selectedBenchmarks, benchmark])
  }

  const handleRemoveBenchmark = (benchmark: string) => {
    setSelectedBenchmarks(selectedBenchmarks.filter((b) => b !== benchmark))
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionContainer className="w-full">
        <RiskQuickStats metrics={metrics} loading={loading} period={period} />
      </SectionContainer>

      <SectionContainer className="w-full">
        <PerformanceBox
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
        <YearlyOverview id={id} selectedBenchmarks={selectedBenchmarks} />
      </SectionContainer>
    </div>
  )
}

export default PagePerformance
