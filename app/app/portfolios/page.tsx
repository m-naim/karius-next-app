'use client'
import PortfoliosList from '@/components/molecules/portfolio/PortfoliosList'

type Props = {
  pftArray: unknown[]
}
const portfolios = ({ pftArray }: Props) => {
  return <PortfoliosList />
}

export default portfolios
