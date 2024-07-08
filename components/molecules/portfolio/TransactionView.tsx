import { useRouter } from 'next/navigation'
import React, { useState, useLayoutEffect } from 'react'
import { get } from '@/services/portfolioService'

const columns = ['symbol', 'date', 'qty', 'price']
function TransactionView({ id }) {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState({ _id: '', allocation: [], transactions: [] })

  const fetchData = async () => {
    try {
      const data = await get(id as string)

      data.allocation = data.allocation.map((item, i) => {
        item.id = i + 1
        return item
      })

      data.transactions.forEach((item, i) => {
        item.id = i + 1
      })
      setPortfolio(data)
    } catch {
      console.error('error api')
      setPortfolio({ _id: '', allocation: [], transactions: [] })
    }
  }

  useLayoutEffect(() => {
    fetchData()
  }, [])

  const addtransaction = async (sense, ticker, prix, qty, date) => {
    // const data = await portfolioService.AddTransaction(
    //   portfolio._id,
    //   sense,
    //   ticker,
    //   prix,
    //   qty,
    //   date
    // )
  }

  return (
    <div>
      {/* <Table
        columns={columns}
        propRows={portfolio.transactions}
        addtransaction={addtransaction}
        type={'transaction'}
      /> */}
    </div>
  )
}

export default TransactionView
