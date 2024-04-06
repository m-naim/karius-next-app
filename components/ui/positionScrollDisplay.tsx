'use client'

import { useEffect, useState } from 'react'

export const PositionScrollDisplay = () => {
  const [scrollWidth, setScrollWidth] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY
      const percentage = Math.min((scrolled / totalHeight) * 100, 100)

      setScrollWidth(percentage)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className="relative sticky top-0 z-20 h-[12px] w-screen bg-primary"
      style={{ width: `${scrollWidth}%` }}
    ></div>
  )
}
