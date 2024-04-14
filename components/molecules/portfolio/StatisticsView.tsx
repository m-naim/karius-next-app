import React, { useState, useLayoutEffect } from 'react'
import portfolioService from '@/services/portfolioService'

function StatisticsView({ id }) {
  const [portfolio, setPortfolio] = useState()
  const [loading, setLoading] = useState(true)
  const fetchData = async () => {
    try {
      const data = await portfolioService.getMetrics(id as string)
      setPortfolio(data[0])
      setLoading(false)
    } catch {
      console.error('error api')
      setPortfolio(undefined)
    }
  }

  useLayoutEffect(() => {
    fetchData()
  }, [])

  return loading ? (
    <div>loading...</div>
  ) : (
    <div>
      <h3>Analyse quantitative</h3>
      <div className="grid max-w-6xl grid-cols-2 gap-4">
        {portfolio &&
          Object.entries(portfolio).map(([k, v]) => (
            <div className="flex gap-4" key={k}>
              <div>{k}</div>
              <div>{v as string}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default StatisticsView
