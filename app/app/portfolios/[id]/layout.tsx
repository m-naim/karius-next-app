'use client'

import { usePathname } from 'next/navigation'
import PortfolioLayout from 'app/app/portfolios/[id]/PortfolioLayout'
import React, { useState, useEffect, Children } from 'react'

import { get } from '@/services/portfolioService'

export default function PortfolioView({ children }) {
  const id = usePathname().split('/')[3]

  const [data, setData] = React.useState([])
  const [portfolio, setPortfolio] = useState({
    _id: '',
    allocation: [],
    transactions: [],
    cashValue: 0,
  })
  const [own, setOwn] = React.useState(false)
  const [followed, setFollowed] = React.useState(false)

  useEffect(() => {
    console.log('fetch from layout', id)
    const fetchData = async (id) => {
      try {
        const res = await get(id as string)
        setOwn(res.own)
        setFollowed(res.followed)
        setPortfolio(res.data)
        setData(res.data.allocation)
      } catch (e) {
        console.error('error api:' + e)
        setPortfolio({ _id: '', allocation: [], transactions: [], cashValue: 0 })
      }
    }
    fetchData(id)
  }, [id])

  return (
    <div>
      <PortfolioLayout
        id={id}
        setPftData={setPortfolio}
        pftData={portfolio}
        isOwn={own}
        followed={followed}
        setFollowed={setFollowed}
      >
        {children}
      </PortfolioLayout>
    </div>
  )
}
