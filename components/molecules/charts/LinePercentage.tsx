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
} from 'chart.js'

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

export const dataSetItem1 = {
  label: 'Performance',
  backgroundColor: 'rgba(37,99,235,0.2)',
  borderColor: 'rgb(37,99,235)',
  fill: true,
  data: [0, 1, 3, 5, 4, 6, 7],
  cubicInterpolationMode: 'monotone',
  tension: 0.4,
}
export const dataSetItem2 = {
  label: 'Performance',
  backgroundColor: 'rgba(137,99,35,0.2)',
  borderColor: 'rgb(137,99,35)',
  fill: true,
  data: [2, 1, 4, 6, 4, 5, 6],
  cubicInterpolationMode: 'monotone',
  tension: 0.4,
}
const data = {
  labels: [0, 1, 2, 3, 4, 5, 6, 7],
  datasets: [dataSetItem1, dataSetItem2],
}

const options = {
  responsive: true,
  elements: {
    arc: {
      weigth: 0.1,
      borderWidth: 3,
    },
  },
  cutout: 50,
}

export function LinePercentage() {
  return (
    <div className="bg-dark-primary order-2 m-2 min-h-[400px] w-full rounded-md p-2 shadow md:order-3">
      <Line
        data={data}
        options={{
          responsive: true,

          elements: {
            line: {
              tension: 0,
              borderWidth: 3,
              borderColor: 'rgba(37,99,235,1)',
              fill: 'start',
              backgroundColor: 'rgba(37,99,235,1)',
            },
            point: {
              radius: 1,
              hitRadius: 1,
            },
          },

          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                color: 'white',
              },
            },
            title: {
              display: false,
            },
          },
        }}
      />
    </div>
  )
}
