'use client'

import { usePathname } from 'next/navigation'
import PerformanceBox from './performanceBox'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import YearlyOverview from './yearlyOverview'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function PagePerformance() {
  const id = usePathname().split('/')[3]

  return (
    <div>
      <SectionContainer>
        <PerformanceBox id={id} />
      </SectionContainer>

      <SectionContainer>
        <YearlyOverview id={id} />
      </SectionContainer>
    </div>
  )
}

export default PagePerformance
