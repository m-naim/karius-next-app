'use client'

import dynamic from 'next/dynamic'
import { createContext, useContext } from 'react'
import type { AmortizationYear, calculateBuyVsRent } from '@/lib/mortgage-math'

export const CalculatorChartsContext = createContext(false)

const PropertyCharts = dynamic(() => import('./PropertyCharts'), { ssr: false })
const MortgageCharts = dynamic(() => import('./MortgageCharts'), { ssr: false })

export function DeferredPropertyCharts({
  data,
}: {
  data: ReturnType<typeof calculateBuyVsRent>['dataSimulation']
}) {
  const visible = useContext(CalculatorChartsContext)
  return visible ? <PropertyCharts data={data} /> : null
}

export function DeferredMortgageCharts({ data }: { data: AmortizationYear[] }) {
  const visible = useContext(CalculatorChartsContext)
  return visible ? <MortgageCharts amortissementData={data} /> : null
}
