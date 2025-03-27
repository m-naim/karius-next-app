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

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')}${unit}`}
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
