'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from '../../atoms/Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from '../../atoms/SearchButton'
import { Button } from '../../ui/button'
import { Avatar, AvatarFallback } from '../../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import useAuth from 'hooks/UseAuth'

import authService from '@/services/authService'

const Header = () => {
  const [authData, isAuthentificated] = useAuth()

  return (
    <header className="border-b py-2">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 xl:max-w-7xl xl:px-0">
        <div>
          <Link data-umami-event={'header-home'} href="/" aria-label={siteMetadata.headerTitle}>
            <div className=" font-mono text-2xl font-semibold italic text-primary ">
              {siteMetadata.headerTitle}
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .filter((link) => !link.draft)
            .map((link) => (
              <Link
                data-umami-event={`header-${link.title}`}
                key={link.title}
                href={link.href}
                className="hidden font-medium text-gray-900 sm:block dark:text-gray-100"
              >
                {link.title}
              </Link>
            ))}
          <SearchButton />
          <ThemeSwitch />

          {isAuthentificated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarFallback>{authData?.sub.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => authService.logOut()}>
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
