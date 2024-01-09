import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import portfolioService from '@/services/portfolioService'
import { format } from 'date-fns'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'

import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement)

const chartDataInit = {
  labels: [2010, 2020, 2030],
  datasets: [
    {
      label: 'Performance',
      backgroundColor: 'rgb(109, 99, 255)',
      borderColor: 'rgb(132, 149, 243)',
      data: [30, 10, 50],
    },
  ],
}

const chartOptions = {
  responsive: true,
  radius: 0,
  // intersect: true,
  scales: {
    // grid:{
    //     display:false
    // },
    x: {
      ticks: {
        color: 'blue',
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
        display: false,
      },
      grid: {
        display: false,
        drawBorder: false,
        drawOnChartArea: false,
        drawTicks: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  // interaction: {
  //     intersect: false,
  //     mode: 'index',
  // },
}
let dividendsData

function DividendsView({ id }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [dates, setDates] = useState(chartDataInit.labels)
  const [perfs, setPerfs] = useState(chartDataInit.datasets[0].data)

  const [period, setPeriod] = useState('Annuel')

  const get_years = (input) => {
    return input.map((s) => format(new Date(s), 'yyyy'))
  }
  const get_months = (input) => {
    return input.map((s) => format(new Date(s), 'MMMM yy'))
  }
  const fetchData = async () => {
    try {
      portfolioService.getDividends(id)
      const data = await portfolioService.get(id as string)
      dividendsData = data.dividends
      setName(data.name)
      setDates(get_years(dividendsData.yearly.Date))
      setPerfs(dividendsData.yearly.values)
    } catch {
      console.log('error api')
    }
  }

  useEffect(() => {
    // fetchData();
    // setLoading(false)
  }, [])

  const handlePeriodClick = (period) => {
    setPeriod(period)
    switch (period) {
      case 'Annuel':
        setDates(get_years(dividendsData.yearly.Date))
        setPerfs(dividendsData.yearly.values)
        break
      case 'Mensuel':
        setDates(get_months(dividendsData.monthy.Date))
        setPerfs(dividendsData.monthy.values)
        break
      default:
        break
    }
  }

  return loading ? (
    <div>Loading ...</div>
  ) : (
    <div className="bg-dark-primary flex flex-col rounded-md lg:flex-row">
      <div className="m-2 flex w-full flex-col  items-center">
        <div className="m-2 w-full ">
          {dates.length > 0 ? (
            <Bar
              id={'Dividends'}
              data={{
                labels: dates,
                datasets: [
                  {
                    label: 'Dividends',
                    backgroundColor: 'rgb(109, 99, 255)',
                    borderColor: 'rgb(109, 99, 255',
                    data: perfs,
                  },
                ],
              }}
              options={chartOptions}
            />
          ) : null}
        </div>
        <MultiSelect list={['Mensuel', 'Annuel']} active={period} select={handlePeriodClick} />
      </div>
    </div>
  )
}

export default DividendsView
