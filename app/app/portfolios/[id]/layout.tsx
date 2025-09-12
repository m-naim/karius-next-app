'use client'

import { usePathname } from 'next/navigation'
import PortfolioLayout from 'app/app/portfolios/[id]/PortfolioLayout'
import React, { useState, useEffect, Children } from 'react'

import { get, getMetadata } from '@/services/portfolioService'

export default function PortfolioView({ children }) {
  const id = usePathname().split('/')[3]
  const [followersSize, setFollowersSize] = useState(0)
  const [own, setOwn] = React.useState(false)
  const [followed, setFollowed] = React.useState(false)
  const [name, setName] = React.useState('Portefeuille')

  useEffect(() => {
    const fetchData = async (id) => {
      try {
        const res = await getMetadata(id as string)
        setOwn(res.own)
        setFollowed(res.followed)
        setFollowersSize(res.followersSize)
        setName(res.name)
      } catch (e) {
        console.error('error api:' + e)
      }
    }
    fetchData(id)
  }, [id])

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
