'use client'

import React from 'react'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'

export interface TickerChartMetrics {
  cagr: number | null
  r2: number | null
  min: number | null
  max: number | null
  allPeriodVariation: number | null
  bestYearVariation: number | null
  worstYearVariation: number | null
}

interface MetricsDisplayProps {
  metrics: TickerChartMetrics
  period: string
  loading: boolean
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, period, loading }) => {
  const renderMetric = (
    label: string,
    value: number | null,
    isPercentage: boolean = true,
    variationColor: boolean = true,
    sign: boolean = true
  ) => (
    <div className="flex flex-col place-items-center gap-1">
      <span className="text-xs uppercase tracking-tight text-muted-foreground">{label}</span>
      {value !== null ? (
        <VariationContainer
          value={isPercentage ? value : value}
          entity={isPercentage ? '%' : ''}
          background={false}
          vaiationColor={variationColor}
          sign={sign}
          className="m-0 p-0 text-xs"
        />
      ) : (
        <span className="text-xs">N/A</span>
      )}
    </div>
  )

  return (
    <>
      {!loading && metrics.cagr !== null && (
        <div className="flex flex-wrap justify-center gap-x-6 rounded-lg border bg-muted/20 px-3 py-2">
          {renderMetric(`CAGR (${period})`, metrics.cagr)}
          {renderMetric(
            'LIN. (R²)',
            metrics.r2 !== null ? metrics.r2 * 100 : null,
            true,
            false,
            false
          )}
          {renderMetric('MIN', metrics.min, false, false, false)}
          {renderMetric('MAX', metrics.max, false, false, false)}
          {renderMetric(`Total Var. (${period})`, metrics.allPeriodVariation)}
          {renderMetric('Best Year', metrics.bestYearVariation)}
          {renderMetric('Worst Year', metrics.worstYearVariation)}
        </div>
      )}
    </>
  )
}

export default MetricsDisplay
