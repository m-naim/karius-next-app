'use client'

import { useEffect, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from '../../atoms/Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import StockCommand from '@/components/molecules/stocks/StockCommand'
import { Button } from '../../ui/button'
import { Avatar, AvatarFallback } from '../../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

import { useAuth } from '@/hooks/useAuth'
import { ChevronDown, Bell, Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'

const Header = () => {
  const { user } = useAuth()
  const [stockCommandOpen, setStockCommandOpen] = useState(false)

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setStockCommandOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const primaryLinks = headerNavLinks.filter(
    (link) => !link.draft && ['/app/portfolios', '/app/watchlist', '/app/market'].includes(link.href)
  )
  const secondaryLinks = headerNavLinks.filter(
    (link) => !link.draft && ['/app/super-investors'].includes(link.href)
  )
  const resourceLink = headerNavLinks.find((link) => link.title === 'Ressources')

  return (
    <header className="relative z-50 h-11 shrink-0 border-b bg-background">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        <div className="shrink-0">
          <Link 
            data-umami-event={'header-home'} 
            href={user ? '/app' : '/'} 
            aria-label={siteMetadata.headerTitle}
          >
            <div className="text-base font-extrabold tracking-tight text-primary sm:text-lg">
              {siteMetadata.headerTitle}
            </div>
          </Link>
        </div>
        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 pl-4 md:flex">
          {primaryLinks.map((link) => (
            <Button variant="ghost" asChild key={link.title} className="h-8 px-2 text-xs font-semibold">
              <Link data-umami-event={`header-${link.title}`} href={link.href}>
                {link.title}
              </Link>
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-1 px-2 text-xs font-semibold">
                Plus <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              {secondaryLinks.map((link) => (
                <DropdownMenuItem key={link.title} asChild>
                  <Link href={link.href} className="w-full cursor-pointer text-xs">
                    {link.title}
                  </Link>
                </DropdownMenuItem>
              ))}
              {resourceLink?.children?.map((child) => (
                <DropdownMenuItem key={child.title} asChild>
                  <Link href={child.href} className="w-full cursor-pointer text-xs">
                    {child.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Rechercher une action"
                  onClick={() => setStockCommandOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechercher une action · ⌘K</p>
              </TooltipContent>
            </Tooltip>
          )}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="hidden h-8 w-8 sm:flex">
                  <Link href="/app/alerts" aria-label="Mes alertes">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Mes alertes</p></TooltipContent>
            </Tooltip>
          )}
          <ThemeSwitch />
          {user ? (
            <Link href="/app/profile">
              <Avatar className="h-7 w-7 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarFallback className="bg-primary text-white">
                  {user.sub.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  Se connecter
                </Button>
              </Link>

              <Link href="/signup" data-umami-event="header-Signup-button">
                <Button className="h-8 px-2.5 text-xs" size="sm" data-umami-event="header-Signup-button">
                  Créer un compte
                </Button>
              </Link>
            </div>
          )}
          <MobileNav onOpenSearch={() => setStockCommandOpen(true)} />
        </div>
      </div>
      <StockCommand open={stockCommandOpen} onOpenChange={setStockCommandOpen} />
    </header>
  )
}

export default Header
