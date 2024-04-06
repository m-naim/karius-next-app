import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import portfolioService from '@/services/portfolioService'
import { format } from 'date-fns'
import { Chart, CategoryScale, LinearScale, LineElement } from 'chart.js'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import { gradientbg } from '@/components/molecules/charts/utils/colors'

Chart.register(CategoryScale, LinearScale, LineElement)

const dataSetItem = {
  label: 'Performance',
  backgroundColor: 'rgb(109, 99, 255)',
  borderColor: 'rgb(132, 149, 243)',
  data: [],
}
const chartDataInit = {
  labels: [],
  datasets: [dataSetItem],
}

function Performance({ id }) {
  const [name, setName] = useState('')
  const [dates, setDates] = useState([])
  const [perfs, setPerfs] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('1M')

  const [allTimePerfs, setAllTimePerfs] = useState([])
  const [allDates, setAllDates] = useState([])

  const formatDateStr = (input) => {
    return input.map((s) => format(new Date(s * 24 * 60 * 60 * 1000), 'dd/MM/yyyy'))
  }

  const fetchData = async () => {
    try {
      const data = await portfolioService.getPerformances(id as string)

      setAllTimePerfs(data.value)
      setAllDates(formatDateStr(data.timestamp))

      setDates(formatDateStr(data.timestamp).slice(-30))
      setPerfs(data.value.slice(-30))

      setLoading(false)
    } catch (e) {
      console.error('error api', e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePeriodClick = (period) => {
    setPeriod(period)

    if (period === 'ALL') {
      setDates(allDates)
      setPerfs(allTimePerfs)
      return
    }

    let days = dates.length
    switch (period) {
      case 'ALL':
        break
      case '1W':
        days = 7
        break
      case '1M':
        days = 30
        break
      case '6M':
        days = 180

        break
      case '1Y':
        days = 365
        break
      default:
        break
    }

    setDates(allDates.slice(-days))
    setPerfs(allTimePerfs.slice(-days))
  }

  return loading ? (
    <div className="bg-dark">Calcule de performances en cours ...</div>
  ) : (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Évolution</CardTitle>
        <MultiSelect
          className="order-3 w-full md:order-2 md:max-w-xs"
          list={['1W', '1M', '6M', '1Y', 'ALL']}
          active={period}
          select={handlePeriodClick}
        />
      </CardHeader>
      <CardContent>
        {dates.length > 0 ? (
          <LineValue
            data={{
              labels: dates,
              datasets: [
                {
                  label: 'Performance',
                  backgroundColor: gradientbg,
                  borderColor: 'rgb(109, 99, 255)',
                  data: perfs,
                },
              ],
            }}
          />
        ) : (
          <LineValue />
        )}
      </CardContent>
    </Card>
  )
}

export default Performance
