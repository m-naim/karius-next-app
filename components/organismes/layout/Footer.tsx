'use client'

import { usePathname } from 'next/navigation'
import { footerRoutes } from '@/data/Routes'
import Link from 'next/link'
import React from 'react'

export default function Footer(props) {
  const pathname = usePathname()

  // Masquer le footer sur toutes les pages applicatives (/app/...)
  if (pathname?.startsWith('/app')) {
    return null
  }

  return (
    <footer className="mt-auto border-t border-border/50 bg-background py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between gap-8">
          <div className="mb-6 md:mb-0 space-y-2">
            <Link href="/" className="flex items-center">
              <span className="self-center whitespace-nowrap text-2xl font-black text-primary">BourseHorus</span>
            </Link>
            <p className="text-xs text-muted-foreground max-w-xs">
              La plateforme moderne pour gérer et analyser vos portefeuilles boursiers en toute simplicité.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
            {footerRoutes.map((f) => (
              <div key={f.key}>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
                  {f.category || 'Navigation'}
                </p>

                <ul className="space-y-2 text-xs text-muted-foreground">
                  {f.routes.map((route) => (
                    <li key={route.title}>
                      <Link data-umami-event={`footer-${route.href}`} href={route.href} className="hover:text-foreground transition-colors">
                        {route.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <hr className="my-8 border-border/40 sm:mx-auto" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BourseHorus™. Tous droits réservés.
          </span>

          <div className="flex space-x-4">
            <a
              className="text-muted-foreground hover:text-foreground transition-colors"
              href="https://twitter.com/BourseHorus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter BourseHorus"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
