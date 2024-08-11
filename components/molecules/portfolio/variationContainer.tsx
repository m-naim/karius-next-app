import React from 'react'
import { round10 } from '@/lib/decimalAjustement'
import { cn } from '@/lib/utils'

export default function variationContainer({
  value,
  entity = '%',
  background = true,
  className,
}: {
  value: number
  entity?: string
  background?: boolean
  className?: string
}) {
  const getVariation = (value) => {
    return round10(value, -2)
  }

  const getVariationColor = (value) => {
    if (value > 0) {
      return `text-green-500 ${background ? 'bg-green-100' : ''}`
    } else if (value < 0) {
      return `text-red-500 ${background ? 'bg-red-100' : ''}`
    }
    return ''
  }

  const numberFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    signDisplay: 'always',
    minimumFractionDigits: 2,
  })

  return (
    <div
      className={cn(
        getVariationColor(value),
        'h-fit rounded-md  p-1 text-xs font-medium',
        className
      )}
    >
      {numberFormatter.format(getVariation(value))} {entity}
    </div>
  )
}