'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Column } from '@tanstack/react-table'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'

const MOBILE_LABELS: Record<string, string> = {
  Variation: 'Var.',
  Résultats: 'Résult.',
  'Rendement Div.': 'Div. %',
  Capitalisation: 'Cap.',
  'Cap. Boursière': 'Cap.',
  Fondamentaux: 'Fondam.',
  Linéarité: 'Linéar.',
  'Linéarité (10a)': 'Lin. 10a',
  'Score (Ret×Lin)': 'Score',
  'Croissance CA': 'Croiss. CA',
  'Croissance CA (5a)': 'CA 5a',
  'PE (5a proxy)': 'P/E 5a',
  'PEG CA (5a)': 'PEG CA',
  'PEG BPA (5a)': 'PEG BPA',
}

export function MetricColumnHeader({
  column,
  title,
  description,
  alignRight = false,
}: {
  column: Column<any, any>
  title: string
  description: string
  alignRight?: boolean
}) {
  const direction = column.getIsSorted()
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown
  return (
    <div
      className={cn(
        'metric-column-header flex min-w-0 flex-wrap items-center gap-0.5 md:flex-nowrap',
        alignRight && 'justify-end'
      )}
    >
      <button
        type="button"
        className="flex min-h-11 min-w-0 items-center gap-0.5 rounded-sm text-left font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-8"
        aria-label={`Trier par ${title}`}
        onClick={() => column.toggleSorting(direction === 'asc')}
      >
        <span className="whitespace-normal md:whitespace-nowrap">
          <span className="md:hidden">{MOBILE_LABELS[title] || title}</span>
          <span className="hidden md:inline">{title}</span>
        </span>
        <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      </button>
      <InfoTooltip label={title} content={description} />
    </div>
  )
}
