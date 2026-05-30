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
  Settings,
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
import { NavBar } from '@/components/ui/tubelight-navbar'

const PortfolioLayout = ({
  id,
  children,
  isOwn,
  followed,
  setFollowed,
  followersSize,
  setFollowersSize,
  name,
}) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleFollowClick = async () => {
    try {
      const res = await follow(id)
      setFollowed(res.followed)
      setFollowersSize(res.followersSize)
    } catch {
      console.error('error')
    }
  }

  const handleDeletePortfolio = async () => {
    try {
      await deletePortfolio(id)
      router.push('/app/portfolios')
    } catch (e) {
      console.error('error', e)
    }
  }

  const isLinkActive = (path: string) => {
    return pathname === path ? 'bg-primary/20' : ''
  }

  const navItems = [
    { name: 'Investissements', url: `/app/portfolios/${id}`, icon: WalletMinimal },
    { name: 'Dividendes', url: `/app/portfolios/${id}/dividends`, icon: GemIcon },
    { name: 'Performance', url: `/app/portfolios/${id}/performance`, icon: TrendingUp },
    { name: 'Activité', url: `/app/portfolios/${id}/transactions`, icon: ArrowLeftRight },
  ]

  return (
    <div>
      <div className="border-b border-border/50 bg-background/95 pb-0 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <SectionContainer>
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Link href={`/app/portfolios`} className="h-fit">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent/50">
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
                <h1 className="text-2xl font-black capitalize tracking-tight">{name}</h1>
              </div>

              <div className="flex items-center gap-4">
                {isOwn ? (
                  <Link href={`/app/portfolios/${id}/settings`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-accent/50" aria-label="Paramètres">
                      <Settings size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={handleFollowClick} size="sm" variant="outline" className="h-8 gap-2 rounded-full border-border/50 bg-background hover:bg-accent/50">
                    <StarIcon
                      className="h-4 w-4"
                      fill={followed ? '#eac54f' : 'transparent'}
                      strokeWidth={followed ? 0 : 2}
                      color={followed ? '#eac54f' : 'currentColor'}
                    />
                    <span className="font-semibold">{followed ? 'Suivis' : 'Suivre'}</span>
                    <span className="text-muted-foreground">({followersSize})</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Horizontal Navigation for Desktop & Mobile */}
            <div className="flex w-full items-center gap-1 overflow-x-auto no-scrollbar border-b border-transparent">
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname === `${item.url}/`
                return (
                  <Link key={item.name} href={item.url}>
                    <div
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-foreground ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon size={16} className="hidden sm:block" />
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer>
        <div className="mb-20 mt-6 flex w-full flex-col">
          <div className="w-full flex-grow rounded-md">{children}</div>
        </div>
      </SectionContainer>
    </div>
  )
}

export default PortfolioLayout
