'use client'

import { useState, useEffect } from 'react'
import Link from '../../atoms/Link'
import headerNavLinks from '@/data/headerNavLinks'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const { user } = useAuth()

  const onToggleNav = () => {
    setNavShow((status) => !status)
  }

  useEffect(() => {
    if (navShow) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [navShow])

  return (
    <>
      <button
        type="button"
        aria-label="Toggle Menu"
        onClick={onToggleNav}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none sm:hidden touch-manipulation active:scale-95 transition-transform"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={`fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col bg-background transition-all duration-300 ease-in-out dark:opacity-[0.98] ${
          navShow
            ? 'translate-x-0 opacity-100 pointer-events-auto visible'
            : 'translate-x-full opacity-0 pointer-events-none invisible'
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none touch-manipulation active:scale-95 transition-transform"
            aria-label="Close Menu"
            onClick={onToggleNav}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-12 py-4">
          {!user && (
            <>
              <Button
                asChild
                variant={'link'}
                data-umami-event="header-Signup-login"
                onClick={onToggleNav}
              >
                <Link href="/login" data-umami-event={`mobile-header-login`}>
                  Se connecter
                </Link>
              </Button>

              <Button data-umami-event="header-Signup-button" onClick={onToggleNav}>
                <Link href="/signup" data-umami-event="header-Signup-button">
                  Crée un compte gratuit
                </Link>
              </Button>
            </>
          )}

          {user && (
            <div className="py-2">
              <Link
                data-umami-event="mobile-header-Search"
                href="/app/stocks"
                className="text-2xl font-bold tracking-widest text-foreground"
                onClick={onToggleNav}
              >
                Recherche
              </Link>
            </div>
          )}

          {headerNavLinks
            .filter((link) => !link.draft)
            .map((link) => {
              if (link.children) {
                return (
                  <div key={link.title} className="flex flex-col items-center gap-2 py-2">
                    <div className="text-2xl font-bold tracking-widest text-foreground">
                      {link.title}
                    </div>
                    {link.children.map((child) => (
                      <Link
                        key={child.title}
                        data-umami-event={`mobile-header-${child.title}`}
                        href={child.href}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                        onClick={onToggleNav}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )
              }
              return (
                <div key={link.title} className="py-2">
                  <Link
                    data-umami-event={`mobile-header-${link.title}`}
                    href={link.href}
                    className="text-2xl font-bold tracking-widest text-foreground"
                    onClick={onToggleNav}
                  >
                    {link.title}
                  </Link>
                </div>
              )
            })}
        </nav>
      </div>
    </>
  )
}

export default MobileNav


