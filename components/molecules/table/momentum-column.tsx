import type { ColumnDef } from '@tanstack/react-table'
import type { security } from 'app/app/watchlist/[id]/data/security'
import { MetricColumnHeader } from './MetricColumnHeader'

const formatReturn = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

const formatMonth = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const description = 'Rendement du cours entre les clôtures de fin des mois M−12 et M−1.'

export function momentumColumn(): ColumnDef<security, number | undefined> {
  return {
    id: 'momentum12m1',
    accessorFn: (row) => row.momentum12m1 ?? undefined,
    sortUndefined: 'last',
    header: ({ column, table }) => {
      const signalMonth = table.getCoreRowModel().rows.find((row) => row.original.momentumSignalMonth)
        ?.original.momentumSignalMonth

      return (
        <MetricColumnHeader
          column={column}
          title="Momentum 12‑1"
          description={signalMonth ? `${description} Signal pour ${formatMonth.format(new Date(signalMonth))}.` : description}
          alignRight
          compactMobile
        />
      )
    },
    cell: ({ getValue, row }) => {
      const value = getValue()
      const month = row.original.momentumSignalMonth
      return (
        <div className="whitespace-nowrap text-right font-mono tabular-nums text-xs md:text-sm">
          <span title={month ? `Signal pour ${formatMonth.format(new Date(month))}` : undefined}>
            {value == null ? '—' : formatReturn.format(value)}
          </span>
        </div>
      )
    },
  }
}
