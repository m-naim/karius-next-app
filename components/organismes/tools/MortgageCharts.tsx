'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRightLeft, TrendingUp } from 'lucide-react'
import type { AmortizationYear } from '@/lib/mortgage-math'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts'

const euros = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

export default function MortgageCharts({
  amortissementData,
}: {
  amortissementData: AmortizationYear[]
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <ArrowRightLeft className="h-3 w-3" /> Répartition Annuelle
          </CardTitle>
          <CardDescription className="text-xs">
            Part des intérêts vs principal par an
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={amortissementData} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis
                dataKey="year"
                fontSize={12}
                label={{
                  value: 'Années',
                  position: 'insideBottom',
                  offset: -5,
                  fontSize: 10,
                }}
              />
              <YAxis fontSize={12} tickFormatter={(v) => `${v}€`} />
              <Tooltip
                formatter={(value, name, props) => {
                  const { payload } = props
                  const percent =
                    name === 'Intérêts'
                      ? payload.percentInterets
                      : name === 'Principal'
                      ? payload.percentPrincipal
                      : payload.totalPaye
                      ? ((payload.assurance / payload.totalPaye) * 100).toFixed(1)
                      : '0.0'
                  return [`${euros(Number(value))} (${percent}%)`, name]
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  borderRadius: '8px',
                }}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                isAnimationActive={false}
                name="Principal"
                dataKey="principal"
                stackId="a"
                fill="#10b981"
              />
              <Bar
                isAnimationActive={false}
                name="Intérêts"
                dataKey="interets"
                stackId="a"
                fill="#ef4444"
              />
              <Bar
                isAnimationActive={false}
                name="Assurance"
                dataKey="assurance"
                stackId="a"
                fill="#6366f1"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" /> Coût Cumulé
          </CardTitle>
          <CardDescription className="text-xs">
            Somme totale des frais (Intérêts + Assurance)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={amortissementData} accessibilityLayer>
              <defs>
                <linearGradient id="colorFrais" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k€`} />
              <Tooltip
                formatter={(v) => euros(Number(v))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  borderRadius: '8px',
                }}
              />
              <Area
                name="Cumul frais"
                type="monotone"
                isAnimationActive={false}
                dataKey="cumulFrais"
                stroke="#ef4444"
                fill="url(#colorFrais)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" /> Capital Restant Dû
          </CardTitle>
          <CardDescription className="text-xs">
            Évolution de la dette au fil des ans
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={amortissementData} accessibilityLayer>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k€`} />
              <Tooltip
                formatter={(v) => euros(Number(v))}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  borderRadius: '8px',
                }}
              />
              <Area
                name="Capital restant"
                type="monotone"
                isAnimationActive={false}
                dataKey="balanceRestante"
                stroke="#10b981"
                fill="url(#colorBalance)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
