'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function AppLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppRoute = pathname?.startsWith('/app')

  if (isAppRoute) {
    return (
      <div className="flex min-h-screen md:h-screen w-full flex-col overflow-y-auto md:overflow-hidden bg-background">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto md:overflow-hidden">
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
