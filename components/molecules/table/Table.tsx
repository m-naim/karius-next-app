import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { comparator } from '@/lib/utils'
import data from '@/data/mock/data'
import { round10 } from '@/lib/decimalAjustement'

const toPrecentille = (val) => round10(val * 100, -2) + '%'

function Table({
  propRows = data.rows,
  columns = data.columns,
  type = 'allocation',
  editable = false,
}) {
  const [ticker, setTicker] = useState('')

  const [columnSorting, setColumnSorting] = useState('')
  const [sortSens, setSortSens] = useState(1)

  const [rows, setRows] = useState(propRows)

  const addclick = (value) => {
    setTicker(value)
  }

  const sortby = (column) => {
    setSortSens(sortSens * -1)
    setColumnSorting(column)
    console.log(column)
    setRows(rows.sort((a, b) => comparator(a[column], b[column]) * sortSens))
  }

  useEffect(() => {
    setRows(propRows)
  }, [propRows])

  return (
    <div>
      <div className="flex place-content-between py-4">
        <p className="text-lg">{rows.length} éléments</p>
        <div className="flex gap-8">
          {editable && <button className="btn-primary">+ Ajouter</button>}
        </div>
      </div>
      <table className="w-full divide-y border-gray-200 ">
        <thead>
          <tr className="">
            {editable && <th></th>}
            {columns.map((c) => (
              <th
                key={c}
                onClick={() => sortby(c)}
                className="py-2 text-left text-lg font-light text-gray-500 dark:text-gray-300"
              >
                <div className="flex gap-1">{c}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 &&
            rows.map((r) =>
              type === 'allocation'
                ? AllocationLine(r, addclick, editable)
                : TransactionLine(r, addclick, editable)
            )}
        </tbody>
      </table>
    </div>
  )
}

const AllocationLine = (r, addclick, editable) => {
  console.log(['r!! : ', r])

  return (
    <tr className="text-md border-separate border-spacing-4 border-b border-gray-200 font-medium dark:border-slate-600 ">
      {editable && (
        <td className="py-2">
          <button
            type="button"
            onClick={() => addclick(r.symbol)}
            className="bg-dark inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Add transaction</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-plus"
              viewBox="0 0 16 16"
            >
              {' '}
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />{' '}
            </svg>
          </button>
        </td>
      )}
      <td className="py-2">
        <div className="flex w-fit flex-col ">
          <p className="">{r.asset?.name}</p>
          <p className="w-fit rounded p-1 align-middle text-xs text-blue-500 ">{r.symbol}</p>
        </div>
      </td>
      <td className="py-2">
        <p className="text-primary">{toPrecentille(r.weight)}</p>
      </td>
      <td className="py-2">
        <p>{r.qty}</p>
      </td>
      <td className="py-2">
        <p>{round10(r.asset?.last, -2)}€</p>
      </td>
      <td className="py-2">
        <p>{round10(r.bep, -2)}€</p>
      </td>
    </tr>
  )
}

const TransactionLine = (r, addclick, editable) => {
  return (
    <tr className="border-collapse border-b border-gray-200 dark:border-slate-600">
      {editable && (
        <td>
          <button
            type="button"
            onClick={() => addclick(r.symbol)}
            className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Add transaction</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-plus"
              viewBox="0 0 16 16"
            >
              {' '}
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />{' '}
            </svg>
          </button>
        </td>
      )}
      <td>
        <div className="flex flex-col">
          <p>{r.symbol}</p>
          <p className="w-fit rounded p-1 align-middle text-xs text-blue-500 ">{r.symbol}</p>
        </div>
      </td>
      <td className="">
        <p className="font-semibold">{format(new Date(r.date), 'MM/dd/yyyy')}</p>
      </td>
      <td className="">
        <p>{r.qty}</p>
      </td>
      <td className="">
        <p>{r.price}</p>
      </td>
    </tr>
  )
}

export default Table
