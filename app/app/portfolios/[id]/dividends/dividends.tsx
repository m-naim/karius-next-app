import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { format } from 'date-fns'

import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDividends } from '@/services/portfolioService'

Chart.register(CategoryScale, LinearScale, BarElement)

const chartOptions = {
  responsive: true,
  radius: 0,
  scales: {
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
        callback: function (val, index) {
          return this.getLabelForValue(val as number) + '€'
        },
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
}

function DividendsView({ id, loading, dates, values }) {
  const [period, setPeriod] = useState('Annuel')
  const get_years = (input) => {
    return input.map((s) => format(new Date(s), 'yyyy'))
  }
  const get_months = (input) => {
    return input.map((s) => format(new Date(s), 'MMMM yy'))
  }

  return loading ? (
    <div>Loading ...</div>
  ) : (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Dividendes</CardTitle>
        {/* <MultiSelect list={['Mensuel', 'Annuel']} active={period} select={handlePeriodClick} /> */}
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
                    backgroundColor: 'rgb(109, 99, 255,0.7)',
                    borderColor: 'rgb(109, 99, 255',
                    data: values,
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
