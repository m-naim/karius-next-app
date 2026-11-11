'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function PwaRegister() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Older installed shortcuts may still launch the site's root URL.
    // Only redirect the landing in standalone mode; keep deep links intact.
    const standalone = window.matchMedia('(display-mode: standalone)')
    const openApp = () => {
      if (pathname === '/' && standalone.matches) router.replace('/app')
    }
    openApp()
    standalone.addEventListener('change', openApp)
    window.addEventListener('pageshow', openApp)
    return () => {
      standalone.removeEventListener('change', openApp)
      window.removeEventListener('pageshow', openApp)
    }
  }, [pathname, router])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
