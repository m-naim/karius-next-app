'use client'

import { usePathname, useRouter } from 'next/navigation'
import PortfolioLayout from 'app/app/portfolios/[id]/PortfolioLayout'
import React, { useState, useEffect } from 'react'

import { getMetadata } from '@/services/portfolioService'

export default function PortfolioView({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const id = pathname.split('/')[3]
  const [followersSize, setFollowersSize] = useState(0)
  const [own, setOwn] = React.useState(false)
  const [followed, setFollowed] = React.useState(false)
  const [name, setName] = React.useState('Portefeuille')

  useEffect(() => {
    const fetchData = async (id: string) => {
      try {
        const res = await getMetadata(id)
        if (!res || res.status === 404 || !res.name) {
          router.replace('/app/portfolios/explore')
          return
        }
        setOwn(res.own)
        setFollowed(res.followed)
        setFollowersSize(res.followersSize)
        setName(res.name)
      } catch (e) {
        console.error('Portfolio 404 or fetch error:', e)
        router.replace('/app/portfolios/explore')
      }
    }

    if (id && id !== 'new' && id !== 'explore') {
      fetchData(id)
    }
  }, [id, router])

  return (
    <PortfolioLayout
      id={id}
      isOwn={own}
      followed={followed}
      setFollowed={setFollowed}
      followersSize={followersSize}
      setFollowersSize={setFollowersSize}
      name={name}
    >
      {children}
    </PortfolioLayout>
  )
}
