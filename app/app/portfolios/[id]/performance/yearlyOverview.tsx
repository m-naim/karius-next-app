import Loader from '@/components/molecules/loader/loader'
import VariationContainer from '@/components/molecules/portfolio/variationContainer'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPerformancesSummary } from '@/services/portfolioService'
import { useEffect, useState } from 'react'

const month = [
  {
    value: 'January',
    display: 'Janvier',
  },
  {
    value: 'February',
    display: 'Février',
  },
  {
    value: 'March',
    display: 'Mars',
  },
  {
    value: 'April',
    display: 'Avril',
  },
  {
    value: 'May',
    display: 'Mai',
  },
  {
    value: 'June',
    display: 'Juin',
  },
  {
    value: 'July',
    display: 'Juillet',
  },
  {
    value: 'August',
    display: 'Août',
  },
  {
    value: 'September',
    display: 'Septembre',
  },
  {
    value: 'October',
    display: 'Octobre',
  },
  {
    value: 'November',
    display: 'Novembre',
  },
  {
    value: 'December',
    display: 'Décembre',
  },
]
export default function YearlyOverview({ id }) {
  const [perf, setPerf] = useState([])
  const [selectedYear, setSelectedYear] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await getPerformancesSummary(id as string)).sort((b, a) => b.year - a.year)
        setPerf(data)
        setSelectedYear(data.at(-1).year)
        setLoading(false)
      } catch (e) {
        console.error('error api', e)
      }
    }
    fetchData()
  }, [id])

  return loading ? (
    <Loader />
  ) : (
    <Card className="text-center ">
      <div className="">
        <div className="flex w-full place-content-center py-4">
          <Select onValueChange={(e) => setSelectedYear(e)} defaultValue={selectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {perf.map(({ year }) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full grid-cols-3">
          <div className="grid w-full grid-rows-13">
            <div className="p-1 text-sm font-light">Années</div>
            {month.map((month) => (
              <div key={month.value} className="p-1 text-sm font-light">
                {month.display}
              </div>
            ))}
            <div className="p-1">Totale</div>
          </div>
          {perf &&
            perf
              .filter(({ year }) => year === selectedYear)
              .map(({ year, performance, monthlyPerformance }) => (
                <div key={year} className="grid w-full grid-rows-14">
                  <div className="text-sm">{year}</div>
                  {month.map((month) => (
                    <div key={month.value} className="flex flex-col items-center">
                      {monthlyPerformance[month.value] ? (
                        <VariationContainer
                          className="w-fit"
                          value={monthlyPerformance[month.value]}
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-col items-center">
                    <VariationContainer className="w-fit" value={performance} />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </Card>
  )
}
