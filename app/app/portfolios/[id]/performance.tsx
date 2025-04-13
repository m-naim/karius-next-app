import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Chart, CategoryScale, LinearScale, LineElement } from 'chart.js'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import { gradientbg } from '@/components/molecules/charts/utils/colors'
import Link from 'next/link'
import { getPerformances } from '@/services/portfolioService'
import Loader from '@/components/molecules/loader/loader'

Chart.register(CategoryScale, LinearScale, LineElement)

function Performance({ id }) {
  const [dates, setDates] = useState([])
  const [perfs, setPerfs] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('1M')

  const [allTimePerfs, setAllTimePerfs] = useState([])
  const [allDates, setAllDates] = useState([])

  const formatDateStr = (input) => {
    return input.map((s) => {
      const date = new Date(s * 24 * 60 * 60 * 1000)
      return format(date, 'dd/MM/yyyy')
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPerformances(id as string, period, 'performance')

        setAllTimePerfs(data.value)
        setAllDates(formatDateStr(data.timestamp))
        setDates(formatDateStr(data.timestamp).slice(-30))
        setPerfs(data.value.slice(-30))
        setLoading(false)
      } catch (e) {
        console.error('error api', e)
      }
    }
    fetchData()
  }, [id])

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
    <Loader />
  ) : (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Évolution</CardTitle>
        <Link href={id + '/performance'}>voir plus</Link>
      </CardHeader>
      <CardContent>
        {dates.length > 0 ? (
          <LineValue
            data={{
              labels: dates,
              datasets: [
                {
                  label: 'Performance',
                  backgroundColor: gradientbg(null),
                  borderColor: 'rgb(109, 99, 255)',
                  data: perfs,
                },
              ],
            }}
          />
        ) : (
          <div>No Data</div>
        )}
      </CardContent>
      <CardFooter>
        <MultiSelect
          className="order-3 w-full md:order-2 md:max-w-xs"
          list={['1W', '1M', '6M', '1Y', 'ALL']}
          active={period}
          select={handlePeriodClick}
        />
      </CardFooter>
    </Card>
  )
}

export default Performance
