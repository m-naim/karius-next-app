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
  Cell,
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
      const key = dataset.label || `value_${dsIndex}`
      point[key] = dataset.data[index]
    })
    return point
  })

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(2) + 'B'
    if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(2) + 'M'
    if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(2) + 'K'
    return value.toLocaleString('fr-FR')
  }

  // Function to determine the color based on the value (used only for single dataset cases)
  const getPointColor = (value: number, defaultColor: string) => {
    // If multiple datasets, stick to the provided category color
    if (data.datasets.length > 1) return defaultColor
    // If single dataset, use red/green for trend visibility
    return value < 0 ? '#ef4444' : '#22c55e'
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
            tick={{ fill: '#666', fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 10 }}
            tickFormatter={(value) => `${formatValue(value)}${unit}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${formatValue(value)}${unit}`, name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              padding: '8px 12px',
              zIndex: 50,
              fontSize: '11px',
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          />
          {data.datasets.length > 1 && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
          )}
          {data.datasets.map((dataset, index) => {
            const dataKey = dataset.label || `value_${index}`
            const defaultColor = dataset.backgroundColor || '#8884d8'
            return (
              <Bar
                key={index}
                name={dataset.label || `Série ${index + 1}`}
                dataKey={dataKey}
                fill={defaultColor} // This ensures the Legend icon matches the bar base color
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              >
                {chartData.map((entry, dataPointIndex) => (
                  <Cell
                    key={`cell-${index}-${dataPointIndex}`}
                    fill={getPointColor(entry[dataKey], defaultColor)}
                  />
                ))}
              </Bar>
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
