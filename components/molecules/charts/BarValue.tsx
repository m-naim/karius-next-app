import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BarValueProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor?: string | string[]
      label?: string
    }[]
  }
  unit?: string
}

export function BarValue({ data, unit = '€' }: BarValueProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: Array.isArray(data.datasets[0].backgroundColor)
      ? data.datasets[0].backgroundColor[index]
      : data.datasets[0].backgroundColor || '#8884d8',
  }))

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
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fillOpacity={0.8} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
