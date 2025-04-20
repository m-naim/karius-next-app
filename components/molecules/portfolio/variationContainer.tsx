import React from 'react'
import { round10 } from '@/lib/decimalAjustement'
import { cn } from '@/lib/utils'

export default function variationContainer({
  value,
  entity = '%',
  background = true,
  className,
  vaiationColor = true,
  sign = true,
}: {
  value: number
  entity?: string
  background?: boolean
  className?: string
  vaiationColor?: boolean
  sign?: boolean
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
    signDisplay: sign ? 'always' : 'never',
    minimumFractionDigits: 2,
  })

  return Number.isNaN(value) ? (
    <div className={cn('m-1 h-fit  rounded-md p-1 text-xs font-medium ', className)}>{value}</div>
  ) : (
    <div
      className={cn(
        vaiationColor && getVariationColor(value),
        'm-1 h-fit  rounded-md p-1 text-xs font-medium ',
        className
      )}
    >
      {numberFormatter.format(getVariation(value))}
      {entity}
    </div>
  )
}
