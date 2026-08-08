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
