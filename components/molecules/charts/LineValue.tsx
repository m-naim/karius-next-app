import { tr } from 'date-fns/locale'
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineValueProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
    }[]
  }
  unit?: string
}

export function LineValue({ data, unit = '€' }: LineValueProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    ...data.datasets.reduce(
      (acc, dataset) => ({
        ...acc,
        [dataset.label]: dataset.data[index],
      }),
      {}
    ),
  }))

  const allYValues = data.datasets.flatMap((set) => set.data).filter((v) => v != null)

  const minValue = Math.min(...allYValues)
  const maxValue = Math.max(...allYValues)

  // Padding as % of range
  const range = maxValue - minValue || 1 // avoid division by zero
  const padding = range * 0.1

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid vertical={true} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#777', fontSize: 11 }}
            dy={10}
            interval={chartData.length > 20 ? Math.floor(chartData.length / 7) : 0}
            tickFormatter={(value, index) => {
              const parts = value.split('/')
              if (parts.length === 3) {
                const day = parts[0]
                const month = parts[1]
                const year = parts[2]

                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                const monthName = date.toLocaleDateString('fr-FR', { month: 'short' })

                if (chartData.length > 300)
                  return monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year
                if (month === '01') return year
                return monthName.charAt(0).toUpperCase() + monthName.slice(1)
              }
              return value
            }}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#999', fontSize: 11 }}
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')}${unit}`}
            domain={[minValue - padding, maxValue + padding]}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('fr-FR')}${unit}`, '']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              paddingLeft: '10px',
            }}
          />
          {data.datasets.map((dataset, index) => (
            <Line
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor || `rgb(${59 + index * 40}, ${130 + index * 20}, 246)`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
