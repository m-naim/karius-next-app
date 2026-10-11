'use client'

import { usePathname } from 'next/navigation'
import { PortfolioFundamentalsOverview } from '../components/PortfolioFundamentalsOverview'

export default function PortfolioFundamentalsPage() {
  const id = usePathname().split('/')[3]

  return <PortfolioFundamentalsOverview portfolioId={id} />
}
