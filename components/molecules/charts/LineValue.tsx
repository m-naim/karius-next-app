import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ChartDataset,
} from 'chart.js'
import { gradientbg } from './utils/colors'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler
)

export const dataSetItem1: ChartDataset<'line', number[]> = {
  label: 'Performance',
  backgroundColor: gradientbg,

  borderColor: 'rgb(37,99,235)',
  fill: true,
  data: [1900, 1750, 2500, 2575, 2400, 2600, 2700, 2868],
  cubicInterpolationMode: 'monotone',
  tension: 0.4,
}
export const dataSetItem2: ChartDataset<'line', number[]> = {
  label: 'Performance',
  backgroundColor: 'rgba(137,99,35,0.2)',
  borderColor: 'rgb(137,99,35)',
  fill: true,
  data: [2, 1, 4, 6, 4, 5, 6],
  cubicInterpolationMode: 'monotone',
  tension: 0.4,
}

const chartOptions = (unit = '€') => ({
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: 'index' as const,
  },

  elements: {
    line: {
      tension: 0,
      borderWidth: 0.5,
      fill: 'start',
    },
    point: {
      radius: 0,
      hitRadius: 0,
    },
  },

  scales: {
    x: {
      display: false,
      ticks: {
        callback: function (val, index) {
          return (val as number) % 3 == 0 ? this.getLabelForValue(val as number) : ''
        },
      },
      grid: {
        display: false,
        drawOnChartArea: false,
        drawTicks: false,
      },
    },
    y: {
      ticks: {
        callback: function (val, index) {
          return this.getLabelForValue(val as number) + unit
        },
      },
      grid: {
        display: false,
        drawOnChartArea: false,
        drawTicks: false,
      },
    },
  },

  plugins: {
    legend: {
      display: false,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        color: 'white',
      },
    },
    title: {
      display: false,
    },
    decimation: {
      enabled: false,
      algorithm: 'min-max' as const,
    },
  },
})

export function LineValue({ data, unit = '€' }) {
  return (
    <div className="bg-dark-primary order-3 w-full rounded-md ">
      <Line data={data} options={chartOptions(unit)} />
    </div>
  )
}
