import React, { ReactNode } from 'react'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowLeftRight,
  EllipsisVertical,
  GemIcon,
  StarIcon,
  Trash2,
  TrendingUp,
  WalletMinimal,
} from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { deletePortfolio, follow } from '@/services/portfolioService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

const PortfolioLayout = ({ pftData, setPftData, id, children, isOwn, followed, setFollowed }) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleFollowClick = async () => {
    try {
      const res = await follow(pftData.id)
      setFollowed(res.followed)
      pftData.followersSize = res.followersSize
      setPftData(pftData)
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

  const isLinkActive = (path: string) => {
    return pathname === path ? 'bg-primary/20' : ''
  }

  return (
    <>
      <div className="border-b py-4">
        <SectionContainer>
          <div className="flex w-full flex-col items-center">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center self-start">
                <Link href={`/app/portfolios`} className="h-fit">
                  <Button variant={'ghost'}>
                    <ArrowLeft />
                  </Button>
                </Link>
                <h1 className="mx-4 capitalize">{pftData.name}</h1>
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
        <div className="flex w-full flex-wrap gap-2 py-2 md:flex-nowrap">
          <div className="hidden flex-col gap-2  md:flex  ">
            <Button
              className={` ${isLinkActive(`/app/portfolios/${id}`)} `}
              variant="ghost"
              asChild
            >
              <Link href={`/app/portfolios/${id}/`}>
                <WalletMinimal className="mr-2 h-4 w-4" />
                Investissements
              </Link>
            </Button>
            <Button
              className={` ${isLinkActive(`/app/portfolios/${id}/dividends`)} justify-start`}
              variant="ghost"
              asChild
            >
              <Link href={`/app/portfolios/${id}/dividends`}>
                <GemIcon className="mr-2 h-4 w-4" /> Dividendes{' '}
              </Link>
            </Button>
            <Button
              className={` ${isLinkActive(`/app/portfolios/${id}/performance`)} justify-start`}
              variant="ghost"
              asChild
            >
              <Link href={`/app/portfolios/${id}/performance`}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Performances
              </Link>
            </Button>
            <Button
              className={` ${isLinkActive(`/app/portfolios/${id}/transactions`)} justify-start`}
              variant="ghost"
              asChild
            >
              <Link href={`/app/portfolios/${id}/transactions`}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Activité
              </Link>
            </Button>
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="bg-dark w-full flex-grow  rounded-md">{children}</div>
          </div>
        </div>
      </SectionContainer>

      <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white md:hidden dark:border-gray-600 dark:bg-gray-700">
        <div className="mx-auto grid h-full max-w-lg grid-cols-4 font-medium">
          <Button
            className={` ${isLinkActive(`/app/portfolios/${id}`)} flex h-12 flex-col p-1`}
            variant="ghost"
            asChild
          >
            <Link href={`/app/portfolios/${id}/`}>
              <WalletMinimal className="mr-2 h-4 w-4" />
              <span className="text-xs">Investissements</span>
            </Link>
          </Button>
          <Button
            className={` ${isLinkActive(
              `/app/portfolios/${id}/dividends `
            )} flex h-12 flex-col justify-start p-1`}
            variant="ghost"
            asChild
          >
            <Link href={`/app/portfolios/${id}/dividends`}>
              <GemIcon className="mr-1 h-4 w-4" />
              <span className="text-xs">Dividendes</span>{' '}
            </Link>
          </Button>
          <Button
            className={` ${isLinkActive(
              `/app/portfolios/${id}/performance`
            )} flex h-12 flex-col justify-start p-1`}
            variant="ghost"
            asChild
          >
            <Link href={`/app/portfolios/${id}/performance`}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Performances
            </Link>
          </Button>
          <Button
            className={` ${isLinkActive(
              `/app/portfolios/${id}/transactions`
            )} flex h-12 flex-col justify-start p-1`}
            variant="ghost"
            asChild
          >
            <Link href={`/app/portfolios/${id}/transactions`}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Activité
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}

export default PortfolioLayout
