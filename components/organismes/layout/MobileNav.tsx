'use client'

import { useState } from 'react'
import Link from '../../atoms/Link'
import headerNavLinks from '@/data/headerNavLinks'
import { BadgeEuro, CrossIcon, MenuIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = 'auto'
      } else {
        // Prevent scrolling
        document.body.style.overflow = 'hidden'
      }
      return !status
    })
  }

  return (
    <>
      <button aria-label="Toggle Menu" onClick={onToggleNav} className="sm:hidden">
        <MenuIcon />
      </button>
      <div
        className={`fixed left-0 top-0 z-10 h-full w-full transform bg-white opacity-95 duration-300 ease-in-out dark:bg-gray-950 dark:opacity-[0.98] ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button className="mr-8 mt-11 h-8 w-8" aria-label="Toggle Menu" onClick={onToggleNav}>
            <X />
          </button>
        </div>

        <nav className="fixed mt-8 flex h-full w-full flex-col items-center gap-4 px-12">
          <Link href="/login">
            <Button variant={'link'} size={'sm'} data-umami-event="header-Signup-login">
              Se connecter
            </Button>
          </Link>

          <Link href="/signup" data-umami-event="header-Signup-button">
            <Button className="h-7" size={'sm'} data-umami-event="header-Signup-button">
              Crée un compte gratuit
            </Button>
          </Link>
          {headerNavLinks
            .filter((link) => !link.draft)
            .map((link) => (
              <div key={link.title} className=" py-4">
                <Link
                  data-umami-event={`header-${link.title}`}
                  href={link.href}
                  className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                  onClick={onToggleNav}
                >
                  {link.title}
                </Link>
              </div>
            ))}
        </nav>
      </div>
    </>
  )
}

export default MobileNav
