'use client'
import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import portfolioService from '@/services/portfolioService'
import { format } from 'date-fns'
import { Chart, CategoryScale, LinearScale, LineElement } from 'chart.js'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'

Chart.register(CategoryScale, LinearScale, LineElement)

const dataSetItem = {
  label: 'Performance',
  backgroundColor: 'rgb(109, 99, 255)',
  borderColor: 'rgb(132, 149, 243)',
  data: [0, 1, 3, 5, 4, 6, 7],
}
const chartDataInit = {
  labels: [],
  datasets: [dataSetItem],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  radius: 0,
  scales: {
    x: {
      ticks: {
        callback: function (val, index) {
          return val % 3 == 0 ? this.getLabelForValue(val) : ''
        },
      },
      grid: {
        display: true,
        drawBorder: true,
        drawOnChartArea: false,
        drawTicks: true,
      },
    },
    y: {
      ticks: {
        callback: function (val, index) {
          return this.getLabelForValue(val) + '%'
        },
      },
    },
  },
  intersect: true,
  interaction: {
    intersect: false,
    mode: 'index',
  },
}

const BenchMarkChois = {
  CAC40: 'FCHI',
  'S&P500': 'GSPC',
}

const listBenchMarks = ['CAC40', 'S&P500']

const perfsData = {}
const datesInit = []

const AllTimePerfs = {}
const benchMarks = []

const palette = ['rgb(209, 99, 255)', 'rgb(109, 199, 55)']

function Performance({ id }) {
  const [name, setName] = useState('')
  const [dates, setDates] = useState(chartDataInit.labels)
  const [perfs, setPerfs] = useState(chartDataInit.datasets[0].data)
  const [loading, setLoading] = useState(false)

  const [period, setPeriod] = useState('ALL')
  const [graphType, setType] = useState('%Variation')

  const [benchmarksPerfs, setBenchmarksPerfs] = useState([])

  const formatDateStr = (input) => {
    return input.map((s) => format(new Date(s * 24 * 60 * 60 * 1000), 'dd/MM/yyyy'))
  }
  const fetchData = async () => {
    try {
      const data = await portfolioService.getPerformances(id as string)
      console.log(data)

      // setName(data.name)
      setDates(formatDateStr(data.timestamp))
      setPerfs(data.value)
      setLoading(false)
    } catch (e) {
      console.error('error api', e)
    }
  }

  //   const AddBenchMarck = async (data, label, color = 'rgb(109, 99, 255)') => {
  //     console.log('Add!!!')
  //     const dataset = {
  //       label,
  //       data,
  //       // backgroundColor: color,
  //       borderColor: color,
  //     }

  //     AllTimePerfs[label] = data

  //     const item = benchMarks.filter((o) => o.label === label)
  //     if (item.length < 1) benchMarks.push(dataset)

  //     setBenchmarksPerfs((prev) => {
  //       const item = prev.filter((o) => o.label === label)
  //       console.log(item)
  //       if (item.length > 0) return prev
  //       return [dataset, ...prev]
  //     })
  //   }

  //   const fetchIndex = async (idxName, length = datesInit.length) => {
  //     const data = await portfolioService.getStocksContains(idxName)
  //     console.log(data)
  //     const values = data[0].history.slice(-length).map((h) => h.Close)

  //     let x = 1
  //     const perfs = values
  //       .map((currVal, index) => {
  //         if (index === 0) {
  //           return 0
  //         }

  //         const prevVal = values[index - 1]
  //         return (currVal - prevVal) / prevVal
  //       })
  //       .map((v) => {
  //         x = x * (1 + v)
  //         return (x - 1) * 100
  //       })

  //     return perfs
  //   }

  useEffect(() => {
    fetchData()
  }, [])

  //   const handlePeriodClick = (period) => {
  //     setPeriod(period)
  //     const cac40Index = benchmarksPerfs.findIndex((obj) => obj.label === 'CAC40')
  //     const sp500Index = benchmarksPerfs.findIndex((obj) => obj.label === 'S&P500')

  //     let perf = perfsData.performance
  //     let days = datesInit.length
  //     switch (period) {
  //       case 'ALL':
  //         break
  //       case '1M':
  //         days = 30
  //         break
  //       case '6M':
  //         days = 180

  //         break
  //       case '1Y':
  //         days = 365
  //         break
  //       default:
  //         break
  //     }

  //     const data = perfsData.performance.slice(-days)
  //     if (period != 'ALL') perf = data.map((x) => x - data[0])
  //     setDates(datesInit.slice(-days))
  //     setPerfs(perf)

  //     const bcopy = benchmarksPerfs
  //     bcopy[cac40Index].data = AllTimePerfs['CAC40']
  //       .slice(-days)
  //       .map((x) => x - AllTimePerfs['CAC40'][AllTimePerfs['CAC40'].length - days])
  //     bcopy[sp500Index].data = AllTimePerfs['S&P500']
  //       .slice(-days)
  //       .map((x) => x - AllTimePerfs['S&P500'][AllTimePerfs['S&P500'].length - days])
  //     setBenchmarksPerfs(bcopy)
  //   }

  //   const handleTypeSelect = (type) => {
  //     setType(type)
  //     switch (type) {
  //       case 'Valeur':
  //         setBenchmarksPerfs([])
  //         setPerfs(perfsData.total)
  //         break
  //       case '%Variation':
  //         setBenchmarksPerfs(benchMarks)
  //         setPerfs(perfsData.performance)
  //         break
  //       case 'Profits/Pertes':
  //         setBenchmarksPerfs([])
  //         setPerfs(perfsData.pnl)
  //         break
  //       default:
  //         break
  //     }
  //   }

  //   const BenchMarkClick = async (symbol, name) => {
  //     const res = await fetchIndex(symbol)
  //     AddBenchMarck(res, name, palette[listBenchMarks.findIndex((e) => e === name)])
  //   }

  //   const deleteBenchItem = (label) => {
  //     console.log('deleteBenchItem ' + label)
  //     setBenchmarksPerfs((prev) => {
  //       return prev.filter((o) => o.label !== label)
  //     })
  //   }

  return loading ? (
    <div className="bg-dark">Calcule de performances en cours ...</div>
  ) : (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Performance</CardTitle>
        {/* <MultiSelect className='w-full md:max-w-xs order-3 md:order-2' list={['1M', '6M', '1Y', 'ALL']} active={period} select={handlePeriodClick} /> */}
      </CardHeader>
      <CardContent>
        {dates.length > 0 ? (
          <LineValue
            data={{
              labels: dates,
              datasets: [
                {
                  label: 'Performance',
                  backgroundColor: 'rgb(109, 99, 255,0.1)',
                  borderColor: 'rgb(109, 99, 255)',
                  data: perfs,
                },
                ...benchmarksPerfs,
              ],
            }}
          />
        ) : (
          <LineValue />
        )}
      </CardContent>
      {/* <MultiSelect className='w-full md:max-w-[300px]' list={['Valeur', 'Profits/Pertes', '%Variation']} active={graphType} /> */}
    </Card>
  )
}

export default Performance

// const BenchSelection = ({ benchmarksPerfs, BenchMarkClick, deleteBenchItem }) => (
//   <div className="m-4 min-w-[8em]">
//     <div className="m-4 flex gap-4">
//       {listBenchMarks
//         .filter((x) => !benchmarksPerfs.map((b) => b.label).includes(x))
//         .map((b) => (
//           <button
//             key={b}
//             className="bg-primary cursor-pointer rounded-lg p-4 shadow"
//             onClick={() => BenchMarkClick(BenchMarkChois[b], b)}
//           >
//             {b}
//           </button>
//         ))}
//     </div>

//     <div>
//       <h3 className="m-4 text-xl text-gray-600">Comparaison</h3>
//       {benchmarksPerfs.map((item) => (
//         <>
//           <div className="m-1 flex justify-between rounded-md border border-gray-600 p-4 shadow">
//             <p> {item.label} </p>
//             <button
//               className="w-fill cursor-pointer text-lg font-bold"
//               onClick={() => deleteBenchItem(item.label)}
//             >
//               x
//             </button>
//           </div>
//         </>
//       ))}
//     </div>
//   </div>
// )
