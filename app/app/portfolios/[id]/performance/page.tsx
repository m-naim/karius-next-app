'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import PerformanceBox from './performanceBox'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import YearlyOverview from './yearlyOverview'
import BenchmarkSelector, { validateBenchmark } from './components/BenchmarkSelector'
import { Card } from '@/components/ui/card'

function PagePerformance() {
  const id = usePathname().split('/')[3]
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleAddBenchmark = (benchmark: string) => {
    if (!validateBenchmark(benchmark)) {
      setError('Format de benchmark invalide')
      return
    }
    if (selectedBenchmarks.includes(benchmark)) {
      setError('Ce benchmark est déjà ajouté')
      return
    }
    setError('')
    setSelectedBenchmarks([...selectedBenchmarks, benchmark])
  }

  const handleRemoveBenchmark = (benchmark: string) => {
    setSelectedBenchmarks(selectedBenchmarks.filter(b => b !== benchmark))
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionContainer className="w-full">
        <Card className="p-4">
          <BenchmarkSelector
            selectedBenchmarks={selectedBenchmarks}
            onAddBenchmark={handleAddBenchmark}
            onRemoveBenchmark={handleRemoveBenchmark}
            error={error}
          />
        </Card>
      </SectionContainer>

      <SectionContainer className="w-full">
        <PerformanceBox id={id} selectedBenchmarks={selectedBenchmarks} />
      </SectionContainer>

      <SectionContainer className="w-full">
        <YearlyOverview id={id} selectedBenchmarks={selectedBenchmarks} />
      </SectionContainer>
    </div>
  )
}

export default PagePerformance
