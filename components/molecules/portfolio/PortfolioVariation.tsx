import React from 'react'
import { round10 } from '@/lib/decimalAjustement'
// import { isDefined } from '@/lib/utils'

export default function PortfolioVariation({ pft }) {
  const getVariation = (pft) => {
    let performance = pft?.perfs?.performance
    if (performance == null) performance = [0]
    return round10([...performance].pop(), -2)
  }
  return <p className="text-md rounded-md px-2 py-1">{getVariation(pft)}%</p>
}
