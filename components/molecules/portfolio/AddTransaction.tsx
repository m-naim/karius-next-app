import React, { useState } from 'react'
import { format } from 'date-fns'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import portfolioService from '@/services/portfolioService'

function AddTransaction({ hide, addClick, symbol }) {
  const [ticker, setTicker] = useState(symbol)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [qty, setQty] = useState('1')
  const [prix, setPrix] = useState('0')
  const [sense, setSense] = useState('buy')

  const fetchData = async (e) => {
    try {
      const response = await portfolioService.getStocksNameByName(e)
      return response
    } catch {
      return []
    }
  }

  return (
    <div className="bg-dark relative flex w-full max-w-xl flex-col items-center  justify-center gap-6 rounded-md px-12 py-8 shadow-xl ">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center justify-between gap-8">
          <p className="text-xl font-semibold leading-7 lg:leading-9 ">Ajouter une transaction</p>
          <div className="-mr-2">
            <button
              type="button"
              onClick={hide}
              className="bg-dark-primary inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Close pop-up</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <MultiSelect active={sense} select={setSense} list={['buy', 'sell']} />
        <div>
          <h3 role="main" className="text-lg font-semibold leading-7 lg:leading-9 ">
            Action
          </h3>
          {/* <Autocomplite value={ticker} setValue={setTicker} fetchData={fetchData} /> */}
        </div>

        <div>
          <h3 role="main" className="text-lg font-semibold leading-7 lg:leading-9 ">
            Date
          </h3>
          <input
            className="input-primary"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.currentTarget.value)
            }}
          />
        </div>
        <div>
          <h3 role="main" className="text-lg font-semibold leading-7 lg:leading-9 ">
            Prix
          </h3>
          <input
            className="input-primary"
            type="number"
            step={0.01}
            value={prix}
            onChange={(e) => setPrix(e.currentTarget.value)}
          />
        </div>
        <div>
          <h3 role="main" className="text-lg font-semibold leading-7 lg:leading-9 ">
            Quantité
          </h3>
          <input
            className="input-primary"
            type="number"
            value={qty}
            onChange={(e) => setQty(e.currentTarget.value)}
          />
        </div>
        <button
          className="btn-primary  w-full"
          onClick={() => {
            addClick(sense, ticker, prix, qty, date)
            hide()
          }}
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

export default AddTransaction
