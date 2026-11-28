import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface DividendsViewProps {
  years: number[]
  totals: number[]
  selectedYear: number
  onSelectYear: (year: number) => void
}

export default function DividendsView({ years, totals, selectedYear, onSelectYear }: DividendsViewProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (elements.length) onSelectYear(years[elements[0].index])
    },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: { callback: (value) => Number(value).toLocaleString('fr-FR') },
      },
    },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dividendes par année</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full sm:h-72">
          <Bar
            role="img"
            aria-label="Graphique annuel des dividendes. Les boutons sous le graphique donnent accès au détail de chaque année."
            data={{
              labels: years.map(String),
              datasets: [{
                label: 'Dividendes comptabilisés',
                data: totals,
                backgroundColor: years.map((year) =>
                  year === selectedYear ? '#6d63ff' : 'rgba(109, 99, 255, 0.35)'
                ),
                maxBarThickness: 40,
              }],
            }}
            options={options}
          />
        </div>
        <div role="group" aria-label="Choisir l’année" className="mt-4 flex flex-wrap gap-2">
          {years.map((year, index) => (
            <button key={year} type="button" aria-pressed={year === selectedYear}
              onClick={() => onSelectYear(year)}
              className="rounded-md border px-3 py-1.5 text-sm tabular-nums hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10">
              {year} · {totals[index].toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
