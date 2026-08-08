'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function AppLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppRoute = pathname?.startsWith('/app')

  // Check if current route requires a fixed trading-terminal layout (Watchlist detail & Market index detail)
  const isFixedRoute =
    Boolean(
      (pathname?.startsWith('/app/watchlist/') &&
        pathname !== '/app/watchlist' &&
        pathname !== '/app/watchlist/new' &&
        !pathname.endsWith('/settings')) ||
        (pathname?.startsWith('/app/market/') && pathname !== '/app/market')
    )

  if (isAppRoute) {
    if (isFixedRoute) {
      return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
          <Header />
          <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
            {children}
          </main>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-background">
        <Header />
        <main className="flex-1 w-full min-h-0 flex flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
