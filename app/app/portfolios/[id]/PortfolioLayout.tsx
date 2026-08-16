import React, { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowLeftRight,
  GemIcon,
  StarIcon,
  TrendingUp,
  WalletMinimal,
  Settings,
  HelpCircle,
} from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { deletePortfolio, follow } from '@/services/portfolioService'
import Link from 'next/link'
import { PortfolioHelpDrawer } from './components/PortfolioHelpDrawer'
import { PortfolioSpotlightTour } from './components/PortfolioSpotlightTour'

const PortfolioLayout = ({
  id,
  children,
  isOwn,
  followed,
  setFollowed,
  followersSize,
  setFollowersSize,
  name,
}: {
  id: string
  children: ReactNode
  isOwn: boolean
  followed?: boolean
  setFollowed?: any
  followersSize?: number
  setFollowersSize?: any
  name?: string
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)

  const handleFollowClick = async () => {
    try {
      const res = await follow(id)
      if (setFollowed) setFollowed(res.followed)
      if (setFollowersSize) setFollowersSize(res.followersSize)
    } catch {
      console.error('error')
    }
  }

  const navItems = [
    { name: 'Investissements', url: `/app/portfolios/${id}`, icon: WalletMinimal },
    { name: 'Dividendes', url: `/app/portfolios/${id}/dividends`, icon: GemIcon },
    { name: 'Performance', url: `/app/portfolios/${id}/performance`, icon: TrendingUp },
    { name: 'Activité', url: `/app/portfolios/${id}/transactions`, icon: ArrowLeftRight },
  ]

  return (
    <div className="flex w-full max-w-full min-w-0 min-h-screen flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background">
      <div className="border-b border-border/50 bg-background/95 pb-0 pt-2 sm:pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full max-w-full min-w-0">
        <SectionContainer>
          <div className="flex w-full max-w-full min-w-0 flex-col">
            <div className="flex w-full items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link href={`/app/portfolios`} className="h-fit shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-accent/50">
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
                <h1 className="text-lg sm:text-2xl font-black capitalize tracking-tight text-foreground truncate">{name}</h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Help & Tour Toggle Button */}
                <Button
                  id="tour-help-button"
                  onClick={() => setIsHelpOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-7 sm:h-8 gap-1.5 rounded-full border-primary/30 bg-primary/10 text-primary text-xs hover:bg-primary/20 font-bold"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Aide & Glossaire</span>
                </Button>

                {isOwn ? (
                  <Link href={`/app/portfolios/${id}/settings`}>
                    <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-accent/50" aria-label="Paramètres">
                      <Settings size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={handleFollowClick} size="sm" variant="outline" className="h-7 sm:h-8 gap-1.5 sm:gap-2 rounded-full border-border/50 bg-background text-xs hover:bg-accent/50">
                    <StarIcon
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      fill={followed ? '#eac54f' : 'transparent'}
                      strokeWidth={followed ? 0 : 2}
                      color={followed ? '#eac54f' : 'currentColor'}
                    />
                    <span className="font-semibold">{followed ? 'Suivis' : 'Suivre'}</span>
                    <span className="text-muted-foreground">({followersSize || 0})</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Horizontal Navigation for Desktop & Mobile */}
            <div id="tour-subnav-links" className="flex w-full max-w-full min-w-0 items-center gap-1 overflow-x-auto no-scrollbar border-b border-transparent">
              {navItems.map((item) => {
                const isActive = pathname === item.url || pathname === `${item.url}/`
                return (
                  <Link key={item.name} href={item.url} className="shrink-0">
                    <div
                      className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap ${
                        isActive ? 'text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon size={15} className="hidden sm:block" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="portfolio-subnav-indicator"
                          className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
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
        <div className="mb-6 sm:mb-12 mt-2 sm:mt-4 flex w-full max-w-full min-w-0 flex-col">
          {children}
        </div>
      </SectionContainer>

      {/* Help Drawer & Spotlight Tour */}
      <PortfolioHelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <PortfolioSpotlightTour isActive={isTourActive} onClose={() => setIsTourActive(false)} />
    </div>
  )
}

export default PortfolioLayout
