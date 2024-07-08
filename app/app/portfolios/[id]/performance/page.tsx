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
        <div className="flex items-center gap-2">
          <Link href={`/app/portfolios/${id}`} className="h-fit">
            <Button variant={'ghost'}>
              <ArrowLeft />
            </Button>
          </Link>
          <h1>Details des Performances </h1>
        </div>
        <PerformanceBox id={id} />
      </SectionContainer>

      <SectionContainer>
        <YearlyOverview id={id} />
      </SectionContainer>
    </div>
  )
}

export default PagePerformance
