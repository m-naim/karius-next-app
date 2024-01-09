import PortfolioVariation from './PortfolioVariation'
import React from 'react'
import { round10 } from '@/lib/decimalAjustement'
import Link from 'next/link'

function PftRow({ pft }) {
  return (
    <Link
      href={`/portfolios/${pft._id}`}
      className="bg-dark-primary my-1 grid w-full grid-cols-2 place-content-between gap-20 rounded-xl border px-4 py-2 hover:cursor-pointer hover:bg-gray-50 md:grid-cols-4 dark:border-slate-600  dark:hover:bg-gray-600"
    >
      <p className="max-h-16 max-w-xs truncate">{pft.name}</p>
      <p className="hidden md:block ">{round10(pft.total_value, -2)}€</p>
      <PortfolioVariation pft={pft} />
      <p className="hidden md:block">{pft.assetsNbr}</p>
    </Link>
  )
}

export default PftRow
