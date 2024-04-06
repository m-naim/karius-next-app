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
  ChartData,
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
const initdata: ChartData<'line', number[], string> = {
  labels: ['07/2023', '08/2023', '09/2023', '10/2023', '11/2023', '12/2023', '01/2024', '02/2024'],
  datasets: [dataSetItem1],
}

export function LineValue({ data = initdata }) {
  return (
    <div className="bg-dark-primary order-3 w-full rounded-md ">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          interaction: {
            intersect: false,
            mode: 'index',
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
                  return this.getLabelForValue(val as number) + '€'
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
              position: 'bottom',
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
              algorithm: 'min-max',
            },
          },
        }}
      />
    </div>
  )
}
