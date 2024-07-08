import { round10 } from '@/lib/decimalAjustement'
import { getPerformancesSummary } from '@/services/portfolioService'
import { useEffect, useState } from 'react'

const defaultPErf = {
  _id: '6665ccb0cadcd165a790784e',
  idPortfolio: '6665ccb0cadcd165a790784e',
  performances: {
    '2019': {
      yearlyPerformance: 1.004353152808791,
      monthlyPerformance: { DECEMBER: 1.004353152808791 },
    },
    '2020': {
      yearlyPerformance: 0.9159332515462721,
      monthlyPerformance: {
        APRIL: 1.099959045993696,
        SEPTEMBER: 0.9609491785327703,
        JULY: 0.9447816348134055,
        MARCH: 0.7627250567325821,
        FEBRUARY: 0.8986443919346866,
        JANUARY: 0.956217614039966,
        OCTOBER: 0.9265469409544264,
        MAY: 1.0512981362667329,
        NOVEMBER: 1.231746420013804,
        DECEMBER: 1.0257531183381516,
        AUGUST: 1.0756560511845663,
        JUNE: 1.0570899051479368,
      },
    },
    '2021': {
      yearlyPerformance: 1.3286197418436496,
      monthlyPerformance: {
        APRIL: 1.0234510247871782,
        SEPTEMBER: 0.9639999002182792,
        JULY: 1.0266777859081964,
        MARCH: 1.028382913170443,
        FEBRUARY: 1.1046783774208047,
        JANUARY: 1.0019875305205856,
        OCTOBER: 1.1111439672931755,
        MAY: 0.9933146466463287,
        NOVEMBER: 0.953012080020533,
        DECEMBER: 1.0238282336785753,
        AUGUST: 1.0744721963453105,
        JUNE: 0.9958446582905034,
      },
    },
    '2022': {
      yearlyPerformance: 0.7153610069237379,
      monthlyPerformance: {
        APRIL: 0.904227823475353,
        SEPTEMBER: 0.8765430649239492,
        JULY: 1.1295058496341603,
        MARCH: 1.0492940545552563,
        FEBRUARY: 0.8878290547842381,
        JANUARY: 0.9625443781597568,
        OCTOBER: 1.031140956590965,
        MAY: 1.0049980632487012,
        NOVEMBER: 1.086852131000882,
        DECEMBER: 0.9369759488633429,
        AUGUST: 0.9525426608100097,
        JUNE: 0.8864856828953502,
      },
    },
    '2023': {
      yearlyPerformance: 1.5491125682334632,
      monthlyPerformance: {
        APRIL: 1.003402882943438,
        SEPTEMBER: 0.9631146930900532,
        JULY: 1.070412193898477,
        MARCH: 1.10075059392661,
        FEBRUARY: 0.9755848744762646,
        JANUARY: 1.107113992449746,
        OCTOBER: 1.0238052939926803,
        MAY: 1.0305234422918714,
        NOVEMBER: 1.1208046979399626,
        DECEMBER: 1.0244761111320397,
        AUGUST: 0.954248722735061,
        JUNE: 1.0895913274342983,
      },
    },
    '2024': {
      yearlyPerformance: 1.095135292236056,
      monthlyPerformance: {
        APRIL: 0.9747141414872329,
        MARCH: 1.0110697329444223,
        FEBRUARY: 1.0188013760517527,
        JANUARY: 1.026209508834381,
        MAY: 1.0466365286084292,
        JUNE: 1.0155187652039557,
      },
    },
  },
}

const month = [
  {
    value: 'JANUARY',
    display: 'Janvier',
  },
  {
    value: 'FEBRUARY',
    display: 'Février',
  },
  {
    value: 'MARCH',
    display: 'Mars',
  },
  {
    value: 'APRIL',
    display: 'Avril',
  },
  {
    value: 'MAY',
    display: 'Mai',
  },
  {
    value: 'JUNE',
    display: 'Juin',
  },
  {
    value: 'JULY',
    display: 'Juillet',
  },
  {
    value: 'AUGUST',
    display: 'Août',
  },
  {
    value: 'SEPTEMBER',
    display: 'Septembre',
  },
  {
    value: 'OCTOBER',
    display: 'Octobre',
  },
  {
    value: 'NOVEMBER',
    display: 'Novembre',
  },
  {
    value: 'DECEMBER',
    display: 'Décembre',
  },
]
export default function YearlyOverview({ id }) {
  const [perf, setPerf] = useState(defaultPErf)
  const fetchData = async () => {
    try {
      console.log('overview')

      const data = await getPerformancesSummary(id as string)

      console.log(data)
    } catch (e) {
      console.error('error api', e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-2 text-center">
      <div className="grid grid-cols-14">
        <div className="p-1">Années</div>
        {month.map((month) => (
          <div key={month.value} className="p-1">
            {month.display}
          </div>
        ))}
        <div className="p-1">Totale</div>
      </div>
      {perf &&
        Object.entries(perf.performances).map(([year, content]) => (
          <div key={year} className="grid grid-cols-14">
            <div>{year}</div>
            {month.map((month) => (
              <div key={month.value} className="p-1">
                {content.monthlyPerformance[month.value] &&
                  round10((content.monthlyPerformance[month.value] - 1) * 100, -2) + '%'}
              </div>
            ))}

            <div>{round10((content.yearlyPerformance - 1) * 100, -2)}%</div>
          </div>
        ))}
    </div>
  )
}
