'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
import { ChevronDown, Bell, Search, MessageCircle, LogOut, UserRound, LoaderCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'

const Header = () => {
  const pathname = usePathname()
  const { user, sessionStatus, sessionEndReason, retrySession, logout } = useAuth()
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
    (link) =>
      !link.draft &&
      ['/app/portfolios', '/app/watchlist', '/app/calendar', '/app/market'].includes(link.href)
  )
  const secondaryLinks = headerNavLinks.filter(
    (link) => !link.draft && ['/app/super-investors'].includes(link.href)
  )
  const resourceLink = headerNavLinks.find((link) => link.title === 'Ressources')

  return (
    <header className="relative z-50 shrink-0 border-b bg-background">
      <div className="mx-auto flex h-11 w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        <div className="shrink-0">
          <Link 
            data-umami-event={'header-home'} 
            href={user || pathname?.startsWith('/app') ? '/app' : '/'}
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
          {(pathname?.startsWith('/app/watchlist/') && pathname !== '/app/watchlist/new' && !pathname.endsWith('/settings') || pathname?.startsWith('/app/market/')) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" aria-label="Ouvrir le support" onClick={() => window.dispatchEvent(new Event('open-support'))}>
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-1.5" aria-label={`Compte de ${user.sub}`}>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-white">
                      {user.sub.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs md:inline">Mon compte</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile"><UserRound className="mr-2 h-4 w-4" />Mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                  <LogOut className="mr-2 h-4 w-4" />Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : sessionStatus === 'checking' ? (
            <span role="status" className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Vérification…
            </span>
          ) : sessionStatus === 'unavailable' ? (
            <Button variant="ghost" size="sm" onClick={retrySession} className="h-8 px-2 text-xs">
              Vérifier ma session
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="hidden px-1 text-xs text-muted-foreground sm:inline">Déconnecté</span>
              <Button asChild size="sm" className="h-8 px-2.5 text-xs">
                <Link href={`/login?redirect=${encodeURIComponent(pathname || '/app')}`}>
                  Se connecter
                </Link>
              </Button>
              <Button asChild variant="ghost" className="hidden h-8 px-2.5 text-xs lg:inline-flex" size="sm">
                <Link href="/signup" data-umami-event="header-Signup-button">Créer un compte</Link>
              </Button>
            </div>
          )}
          <MobileNav onOpenSearch={() => setStockCommandOpen(true)} />
        </div>
      </div>
      {sessionStatus === 'anonymous' && sessionEndReason && sessionEndReason !== 'required' && (
        <div role="status" className="border-t bg-muted px-3 py-2 text-center text-sm text-foreground">
          {sessionEndReason === 'expired'
            ? 'Session expirée. Vous êtes déconnecté.'
            : sessionEndReason === 'rejected'
              ? 'Session refusée par le serveur. Vous êtes déconnecté.'
              : 'Vous êtes déconnecté.'}
          {' '}<Link href={`/login?redirect=${encodeURIComponent(pathname || '/app')}`} className="font-medium text-primary underline underline-offset-4">Se reconnecter</Link>
        </div>
      )}
      {sessionStatus === 'unavailable' && (
        <div role="status" className="flex flex-wrap items-center justify-center gap-x-2 border-t bg-muted px-3 py-2 text-center text-sm text-foreground">
          <span>Impossible de vérifier votre session. Votre connexion n’est pas confirmée.</span>
          <button type="button" onClick={logout} className="font-medium text-primary underline underline-offset-4">Se déconnecter</button>
        </div>
      )}
      <StockCommand open={stockCommandOpen} onOpenChange={setStockCommandOpen} />
    </header>
  )
}

export default Header
