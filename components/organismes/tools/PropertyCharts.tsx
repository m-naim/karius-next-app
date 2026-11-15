'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { calculateBuyVsRent } from '@/lib/mortgage-math'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const euros = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
type Comparison = ReturnType<typeof calculateBuyVsRent>

function ComparisonChart({
  data,
  wealth = false,
}: {
  data: Comparison['dataSimulation']
  wealth?: boolean
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">
          {wealth ? 'Patrimoine net projeté' : 'Dépenses non récupérables cumulées'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="h-[280px] w-full"
          role="img"
          aria-label={
            wealth
              ? 'Évolution des patrimoines en achetant ou en louant, épargne comprise.'
              : 'Comparaison des loyers avec les frais d’acquisition, intérêts, assurance et charges du propriétaire.'
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} accessibilityLayer margin={{ left: 0, right: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="year" fontSize={12} tickFormatter={(value) => `${value} a`} />
              <YAxis
                width={64}
                fontSize={12}
                tickFormatter={(value) => `${Math.round(value / 1000)} k€`}
              />
              <Tooltip
                labelFormatter={(year) => `Année ${year}`}
                formatter={(value) => euros(Number(value))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  color: 'hsl(var(--popover-foreground))',
                  borderColor: 'hsl(var(--border))',
                  fontSize: '14px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Line
                name="Achat"
                dataKey={wealth ? 'Patrimoine Achat' : 'Frais perdus Achat'}
                stroke="#059669"
                strokeWidth={2}
                dot={data.length === 1}
                isAnimationActive={false}
              />
              <Line
                name="Location"
                dataKey={wealth ? 'Patrimoine Location' : 'Coût Location'}
                stroke="#6366f1"
                strokeWidth={2}
                dot={data.length === 1}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PropertyCharts({ data }: { data: Comparison['dataSimulation'] }) {
  return (
    <>
      <ComparisonChart data={data} wealth />
      <ComparisonChart data={data} />
    </>
  )
}
