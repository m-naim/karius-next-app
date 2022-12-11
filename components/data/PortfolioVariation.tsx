import React from 'react'
import { round10 } from '../../utils/decimalAjustement'
import { isDefined } from '../../utils/utils'

export default function PortfolioVariation({pft}) {
  const getVariation= (pft)=>{
    let performance= pft?.perfs?.performance 
    if(!isDefined(performance)) performance=[0]
    return round10([...performance].pop(),-2)
  }
  return (

    <p className='text-sm rounded-md px-2 py-1'>{getVariation(pft)}%</p>
  )
}
