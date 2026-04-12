'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from '../../atoms/Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import { Button } from '../../ui/button'
import { Avatar, AvatarFallback } from '../../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'

import { useAuth } from '@/hooks/useAuth'
import { ChevronDown, Bell } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'

const Header = () => {
  const { user } = useAuth()


  return (
    <header className="border-b py-2">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 xl:max-w-7xl xl:px-0">
        <div>
          <Link data-umami-event={'header-home'} href="/" aria-label={siteMetadata.headerTitle}>
            <div className="text-2xl font-semibold italic text-primary ">
              {siteMetadata.headerTitle}
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .filter((link) => !link.draft)
            .map((link) => {
              if (link.children) {
                return (
                  <DropdownMenu key={link.title}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="hidden items-center gap-1 font-medium text-gray-900 dark:text-gray-100 sm:flex"
                      >
                        {link.title} <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {link.children.map((child) => (
                        <DropdownMenuItem key={child.title} asChild>
                          <Link href={child.href} className="w-full cursor-pointer">
                            {child.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
              return (
                <Button variant="ghost" asChild key={link.title}>
                  <Link
                    data-umami-event={`header-${link.title}`}
                    href={link.href}
                    className="hidden font-medium text-gray-900 dark:text-gray-100 sm:block"
                  >
                    {link.title}
                  </Link>
                </Button>
              )
            })}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                  <Link href="/app/alerts">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mes Alertes</p>
              </TooltipContent>
            </Tooltip>
          )}
          <ThemeSwitch />
          {user ? (
            <Link href="/app/profile">
              <Avatar className="cursor-pointer transition-opacity hover:opacity-80">
                <AvatarFallback className="bg-primary text-white">
                  {user.sub.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden md:block">
              <Link href="/login">
                <Button variant={'link'} size={'sm'}>
                  Se connecter
                </Button>
              </Link>

              <Link href="/signup" data-umami-event="header-Signup-button">
                <Button className="h-7" size={'sm'} data-umami-event="header-Signup-button">
                  Crée un compte gratuit
                </Button>
              </Link>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
