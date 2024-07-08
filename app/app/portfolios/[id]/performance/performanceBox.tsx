import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { format } from 'date-fns'
import { Chart, CategoryScale, LinearScale, LineElement } from 'chart.js'
import { LineValue } from '@/components/molecules/charts/LineValue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import MultiSelect from '@/components/molecules/layouts/MultiSelect'
import { gradientbg } from '@/components/molecules/charts/utils/colors'
import { getPerformances } from '@/services/portfolioService'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

Chart.register(CategoryScale, LinearScale, LineElement)

function PerformanceBox({ id }) {
  const [chartType, setChartType] = useState('value')
  const [dates, setDates] = useState([])
  const [chartValues, setChartValues] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('1M')

  const [allDates, setAllDates] = useState([])
  const [data, setData] = useState({})

  const formatDateStr = (input) => {
    return input.map((s) => format(new Date(s * 24 * 60 * 60 * 1000), 'dd/MM/yyyy'))
  }

  const fetchData = async () => {
    try {
      const res = await getPerformances(id as string)
      setData(res)
      setAllDates(formatDateStr(res.timestamp))
      setDates(formatDateStr(res.timestamp).slice(-30))
      setChartValues(res[chartType].slice(-30))
      setLoading(false)
    } catch (e) {
      console.error('error api', e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePeriodClick = (period, type = chartType) => {
    setPeriod(period)

    const allValues = data[type]

    console.log(data, allValues)

    if (period === 'ALL') {
      setDates(allDates)
      setChartValues(allValues)

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
    setChartValues(allValues.slice(-days))
  }

  const handleChartTypeClick = (type) => {
    console.log('type', 'handleChartTypeClick', type)
    setChartType(type)
    handlePeriodClick(period, type)
  }

  return loading ? (
    <div className="bg-dark">Calcule de performances en cours ...</div>
  ) : (
    <Card>
      <CardHeader className="flex flex-col items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-md font-semibold capitalize">Évolution</CardTitle>
        <div className="flex w-full justify-between p-3">
          <Select onValueChange={handleChartTypeClick} defaultValue={chartType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="dailyGains">dailyGains</SelectItem>
                <SelectItem value="value">value</SelectItem>
                <SelectItem value="cumulativeGains">cumulativeGains</SelectItem>
                <SelectItem value="CumulativePerformance">CumulativePerformance</SelectItem>
                <SelectItem value="cashValue">cashValue</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <MultiSelect
            className="order-3 w-full md:order-2 md:max-w-xs"
            list={['1W', '1M', '6M', '1Y', 'ALL']}
            active={period}
            select={handlePeriodClick}
          />
        </div>
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
                  data: chartValues,
                },
              ],
            }}
          />
        ) : (
          <LineValue />
        )}
      </CardContent>
      <CardFooter className="flex w-full justify-between"></CardFooter>
    </Card>
  )
}

export default PerformanceBox
