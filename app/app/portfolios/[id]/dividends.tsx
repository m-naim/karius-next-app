import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import portfolioService from '@/services/portfolioService'
import { format } from 'date-fns'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'

import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

Chart.register(CategoryScale, LinearScale, BarElement)

const chartDataInit = {
  labels: [2022, 2023, 2024],
  datasets: [
    {
      label: 'Performance',
      backgroundColor: 'rgb(109, 99, 255)',
      borderColor: 'rgb(132, 149, 243)',
      data: [0, 70, 190],
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
        display: true,
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
  const [dates, setDates] = useState<unknown>(chartDataInit.labels)
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
      const dividends = await portfolioService.getDividends(id)
      console.log(dividends)
      setDates(Object.keys(dividends.yearlyDividends))
      console.log(Object.values(dividends.yearlyDividends).map((v) => v.totalAmount))

      setPerfs(Object.values(dividends.yearlyDividends).map((v) => v.totalAmount))
    } catch (e) {
      console.log('error api', e)
    }
  }

  useEffect(() => {
    fetchData()
    setLoading(false)
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Dividendes</CardTitle>
        <MultiSelect list={['Mensuel', 'Annuel']} active={period} select={handlePeriodClick} />
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

export default DividendsView
