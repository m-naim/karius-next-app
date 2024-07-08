import React, { ReactNode, useState } from 'react'

import { round10 } from '@/lib/decimalAjustement'
import { useRouter } from 'next/navigation'
import StatsCard from '../../../../components/molecules/portfolio/statsCard'
import { Button } from '@/components/ui/button'
import { BanknoteIcon, EllipsisVertical, GemIcon, StarIcon, Trash2, TrendingUp } from 'lucide-react'
import Performance from './performance'
import DividendsView from './dividends'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { deletePortfolio, follow, unfollow } from '@/services/portfolioService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Props = {
  children?: ReactNode
  title?: string
}

const PortfolioLayout = ({ pftData, id, children, isOwn }) => {
  const router = useRouter()

  const [followed, setFollowed] = useState(false)

  const handleFollowClick = async () => {
    try {
      setFollowed(() => !followed)

      if (followed) await unfollow(pftData.id)
      else await follow(pftData.id)
    } catch {
      console.error('error')
    }
  }

  const handleDeletePortfolio = async () => {
    try {
      await deletePortfolio(pftData.id)
      router.push('/app/portfolios')
    } catch (e) {
      console.error('error', e)
    }
  }

  return (
    <>
      <div className="border-b py-4">
        <SectionContainer>
          <div className="flex w-full flex-col items-center">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start self-start">
                <h2 className="text-2xl font-bold capitalize">{pftData.name}</h2>
              </div>

              <div className="flex items-center gap-4">
                {isOwn ? (
                  <>
                    {/* <Button size="sm" variant="outline">
                      <Share2 className="mr-1 h-4" />
                      Partager
                    </Button> */}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size={'sm'} variant="ghost">
                          <EllipsisVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={handleDeletePortfolio}>
                            <Trash2 className="h-4 text-red-600" strokeWidth={1} />
                            <span>Supprimer</span>
                            <DropdownMenuShortcut>ctrl + d</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button onClick={handleFollowClick} size="sm" variant="outline" className="gap-1">
                    <StarIcon
                      className="h-5 w-5"
                      fill={followed ? '#eac54f' : '#999'}
                      strokeWidth={0}
                    />
                    <span className="w-10 text-foreground">{followed ? 'Suivis' : 'Suivre'}</span>
                    <span className="text-foreground"> {pftData.followersSize}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer>
        <div className="flex w-full content-between gap-6 py-2">
          <StatsCard
            title={'Valeur Total'}
            amount={round10(pftData.totalValue, -2)}
            variation={round10(pftData.cumulativePerformance, -2)}
            Icon={<BanknoteIcon />}
          />
          <StatsCard
            title={'Variation du jour'}
            amount={round10(pftData.dayChangeValue, -2)}
            variation={round10(pftData.dayChangePercent, -2)}
            Icon={<TrendingUp />}
          />
          <StatsCard
            Icon={<GemIcon />}
            title={'Rendement'}
            amount={190}
            variation={round10(190 / 120, -2)}
          />
        </div>

        <div className="flex w-full flex-wrap gap-2 py-2 md:flex-nowrap">
          <div className="flex w-full flex-col gap-2 md:w-3/5">
            <div className="bg-dark w-full flex-grow  rounded-md">{children}</div>
          </div>

          <div className="flex w-full  flex-col gap-2 md:w-2/5">
            <Performance id={id} />
            <DividendsView id={id} />
          </div>
        </div>
      </SectionContainer>
    </>
  )
}

export default PortfolioLayout
