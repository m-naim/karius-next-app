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
  ReferenceLine,
  ReferenceDot,
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
  isLogarithmic?: boolean
  transactions?: any[]
}

const CustomTooltip = ({ active, payload, label, unit, markers }: any) => {
  if (active && payload && payload.length) {
    const txsForLabel = markers?.filter((m: any) => m.xLabel === label)

    return (
      <div className="rounded-lg border border-border bg-background bg-opacity-95 p-3 shadow-xl backdrop-blur-sm">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-medium text-foreground">{entry.name}</span>
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: entry.color }}>
                {entry.value?.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {unit}
              </span>
            </div>
          ))}
        </div>

        {txsForLabel && txsForLabel.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border space-y-1">
            {txsForLabel.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                <span className={tx.isBuy ? 'text-emerald-500' : 'text-rose-500'}>
                  {tx.isBuy ? '▲ ACHAT' : '▼ VENTE'} : {tx.qty} unit. @ {tx.price?.toLocaleString('fr-FR')} {unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  return null
}

export function LineValue({ data, unit = '€', isLogarithmic = false, transactions = [] }: LineValueProps) {
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

  const markers = React.useMemo(() => {
    if (!transactions || transactions.length === 0 || !data.labels || data.labels.length === 0) return []

    const primaryDataset = data.datasets[0]
    if (!primaryDataset) return []

    return transactions
      .map((tx) => {
        if (!tx.date) return null
        const txDate = new Date(tx.date)
        if (isNaN(txDate.getTime())) return null

        let closestLabel: string | null = null
        let closestIndex = -1
        let minDiff = Infinity

        data.labels.forEach((label, idx) => {
          const parts = label.split('/')
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
            const diff = Math.abs(d.getTime() - txDate.getTime())
            if (diff < minDiff) {
              minDiff = diff
              closestLabel = label
              closestIndex = idx
            }
          }
        })

        if (minDiff < 7 * 24 * 60 * 60 * 1000 && closestLabel && closestIndex !== -1) {
          const yVal = primaryDataset.data[closestIndex]
          if (yVal != null && !isNaN(yVal)) {
            const isBuy = (tx.qty ?? 0) > 0 || tx.type === 'Acheter' || tx.type === 'buy'
            return {
              xLabel: closestLabel,
              yVal,
              isBuy,
              qty: Math.abs(tx.qty || 0),
              price: tx.price || yVal,
              date: tx.date,
            }
          }
        }
        return null
      })
      .filter(Boolean) as any[]
  }, [transactions, data.labels, data.datasets])

  const allYValues = data.datasets.flatMap((set) => set.data).filter((v) => v != null)
  const minValue = Math.min(...allYValues)

  // Domain handling
  const domain = isLogarithmic
    ? minValue > 0
      ? ['auto', 'auto']
      : [0.01, 'auto']
    : ['auto', 'auto']

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 25, right: 10, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--muted-foreground))"
            opacity={0.1}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
            dy={10}
            interval="preserveStartEnd"
            minTickGap={30}
            tickFormatter={(value) => {
              const parts = value.split('/')
              if (parts.length === 3) {
                const date = new Date(
                  parseInt(parts[2]),
                  parseInt(parts[1]) - 1,
                  parseInt(parts[0])
                )
                if (chartData.length > 365)
                  return date.toLocaleDateString('fr-FR', { year: 'numeric' })
                return date.toLocaleDateString('fr-FR', { month: 'short' })
              }
              return value
            }}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')}${unit}`}
            domain={domain as any}
            scale={isLogarithmic ? 'log' : 'auto'}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} markers={markers} />}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {unit === '%' && (
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              opacity={0.5}
            />
          )}

          <Legend
            verticalAlign="top"
            align="right"
            height={40}
            iconType="circle"
            iconSize={6}
            formatter={(value) => (
              <span className="text-[11px] font-semibold uppercase tracking-tight text-muted-foreground">
                {value}
              </span>
            )}
          />

          {data.datasets.map((dataset, index) => {
            const isMain = index === 0
            return (
              <Line
                key={dataset.label}
                name={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={
                  dataset.borderColor ||
                  (isMain ? 'hsl(var(--primary))' : `hsl(${(200 + index * 45) % 360}, 60%, 60%)`)
                }
                strokeWidth={isMain ? 3 : 1.5}
                strokeOpacity={isMain ? 1 : 0.7}
                dot={false}
                activeDot={{
                  r: isMain ? 5 : 4,
                  strokeWidth: 0,
                  fill:
                    dataset.borderColor ||
                    (isMain ? 'hsl(var(--primary))' : `hsl(${(200 + index * 45) % 360}, 60%, 60%)`),
                }}
                animationDuration={1000}
                connectNulls
              />
            )
          })}

          {/* Marqueurs d'achats / ventes sur le graphique */}
          {markers.map((m: any, idx: number) => (
            <ReferenceDot
              key={idx}
              x={m.xLabel}
              y={m.yVal}
              r={6}
              shape={(props: any) => {
                const { cx, cy } = props
                if (cx == null || cy == null) return <g key={idx} />
                const color = m.isBuy ? '#10b981' : '#ef4444'
                return (
                  <g key={idx} className="cursor-pointer">
                    <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.25} />
                    <circle cx={cx} cy={cy} r={5} fill={color} stroke="#ffffff" strokeWidth={1.5} />
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fill={color}
                      fontSize={10}
                      fontWeight="bold"
                    >
                      {m.isBuy ? `▲` : `▼`}
                    </text>
                  </g>
                )
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
