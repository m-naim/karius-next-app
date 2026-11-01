'use client'
import { Suspense } from 'react'
import { ConsensusExplore } from '../components/ConsensusExplore'
export default function Page() {
  return (
    <Suspense>
      <ConsensusExplore view="topSells" />
    </Suspense>
  )
}
