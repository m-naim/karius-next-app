import type { ColumnDef } from '@tanstack/react-table'

export interface DividendRow {
  date: number
  symbol: string
  amountByShare: number | null
  totalAmount: number
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})

export const dividendTotalFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})

const amountByShareFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 6,
})

export const columns: ColumnDef<DividendRow>[] = [
  {
    accessorKey: 'date',
    header: 'Détachement',
    cell: ({ row }) => dateFormat.format(row.original.date * 1000),
  },
  { accessorKey: 'symbol', header: 'Action' },
  {
    accessorKey: 'amountByShare',
    header: 'Par action',
    cell: ({ row }) => row.original.amountByShare == null ? '—' : amountByShareFormat.format(row.original.amountByShare),
  },
  {
    accessorKey: 'totalAmount',
    header: 'Pour la position',
    cell: ({ row }) => <span className="font-medium tabular-nums">{dividendTotalFormat.format(row.original.totalAmount)}</span>,
  },
]
