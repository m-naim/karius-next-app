import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarValueProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor?: string
      label?: string
    }[]
  }
  unit?: string
}

export function BarValue({ data, unit = '' }: BarValueProps) {
  // Transform data for Recharts: array of objects where each object is a point on X axis
  const chartData = data.labels.map((label, index) => {
    const point: any = { name: label }
    data.datasets.forEach((dataset, dsIndex) => {
      point[`value_${dsIndex}`] = dataset.data[index]
    })
    return point
  })

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + 'B'
    if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + 'M'
    if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(2) + 'K'
    return value.toLocaleString('fr-FR')
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
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
            tickFormatter={(value) => `${formatValue(value)}${unit}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const datasetIndex = parseInt(name.split('_')[1])
              const label = data.datasets[datasetIndex]?.label || ''
              return [`${formatValue(value)}${unit}`, label]
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              padding: '8px 12px',
              zIndex: 50,
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          />
          {data.datasets.length > 1 && <Legend verticalAlign="top" height={36} />}
          {data.datasets.map((dataset, index) => (
            <Bar
              key={index}
              dataKey={`value_${index}`}
              name={`value_${index}`}
              fill={dataset.backgroundColor || '#8884d8'}
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
