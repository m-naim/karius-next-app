'use client'

import { ThemeProvider } from 'next-themes'
import siteMetadata from '@/data/siteMetadata'

// React 19 warns about the script tag next-themes uses to prevent FOUC.
// This filter suppresses that specific warning in development.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme} enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
