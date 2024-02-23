import React, { ReactNode, useState } from 'react'
import authService from '@/services/authService'
import portfolioService from '@/services/portfolioService'
import stockService from '@/services/stock.service'

import { round10 } from '@/lib/decimalAjustement'
import { useRouter } from 'next/navigation'
import StatsCard from '../../../../components/molecules/portfolio/statsCard'
import { Button } from '@/components/ui/button'
import { BanknoteIcon, GemIcon, Share2, StarIcon, Trash2, TrendingUp } from 'lucide-react'
import Performance from './performance'
import DividendsView from './dividends'

type Props = {
  children?: ReactNode
  title?: string
}

const PortfolioLayout = ({ pftData, children }) => {
  const router = useRouter()

  const [followed, setFollowed] = useState(false)
  const [editable, setEditable] = useState(false)
  const [variation, setVariation] = useState(0)
  const [variationPct, setVariationPct] = useState(0)

  const getDayVariation = (total) => {
    if (!total) {
      console.error(total)
      return
    }
    const last = total.length
    setVariation(round10(total[last - 1] - total[last - 2], -2))
    setVariationPct(round10(((total[last - 1] - total[last - 2]) / total[last - 2]) * 100, -2))
  }

  const follow = async () => {
    try {
      setFollowed(!followed)
      await portfolioService.follow(pftData.id)
    } catch {
      console.log('error')
    }
  }

  const deletePortfolio = async () => {
    try {
      await portfolioService.deletePortfolio(pftData.id)
      router.push('/portfolios')
    } catch {
      console.log('error')
    }
  }

  const camputeRandement = () => {
    if (pftData.dividends === undefined) return 0
    const last = pftData.dividends.yearly.values.slice(-1)
    return round10((last / pftData.total_value) * 100, -2)
  }

  const getPctRandement = () => {
    if (pftData.dividends === undefined) return 0
    return round10(pftData?.dividends.yearly.values.reduce((cum, e) => cum + e, 0), -2)
  }

  return (
    <div className=" bg-dark flex w-full max-w-7xl flex-col place-items-center overflow-hidden">
      <div className="bg-dark-primary flex w-full flex-col items-center rounded-md py-2">
        <div className="flex w-full items-start  justify-between">
          <div className="flex flex-col items-start self-start">
            <h2 className="text-3xl font-bold capitalize">{pftData.name}</h2>
          </div>

          <div className="m-1 flex items-center gap-4">
            <Button onClick={follow} size="sm" variant="outline">
              <StarIcon
                className="mr-2 h-5 w-5"
                fill={followed ? '#eac54f' : '#999'}
                strokeWidth={0}
              />
              <span className="mr-2 w-10">{followed ? 'Suivis' : 'Suivre'}</span>
              <span className=" text-gray-500"> {pftData.followers?.length} 0</span>
            </Button>

            {true && (
              <>
                <Button size="sm" variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
                <Button onClick={deletePortfolio} size="sm" variant="outline">
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" strokeWidth={1} />
                  Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-2 p-6">
        <div className="flex w-2/3 flex-col gap-2">
          <div className="flex max-h-fit w-full flex-grow content-between gap-2 ">
            <StatsCard
              title={'Valeur Total'}
              amount={12000}
              variation={20}
              Icon={<BanknoteIcon />}
            />
            <StatsCard
              title={'Variation du jour'}
              amount={360}
              variation={3}
              Icon={<TrendingUp />}
            />
            <StatsCard
              Icon={<GemIcon />}
              title={'Rendement'}
              amount={190}
              variation={round10(190 / 120, -2)}
            />
          </div>
          <Performance id={pftData.id} />

          <div className="bg-dark w-full flex-grow  rounded-md">{children}</div>
        </div>

        <div className="flex w-1/3 flex-col gap-2">
          <DividendsView id={pftData.id} />
        </div>
      </div>
    </div>
  )
}

export default PortfolioLayout
