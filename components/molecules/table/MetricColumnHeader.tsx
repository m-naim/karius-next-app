'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Column } from '@tanstack/react-table'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

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
  compactMobile = false,
}: {
  column: Column<any, any>
  title: string
  description: string
  alignRight?: boolean
  compactMobile?: boolean
}) {
  const direction = column.getIsSorted()
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown
  return (
    <>
      {compactMobile && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Trier et informations : ${title}`}
              className={cn(
                'flex min-h-11 w-full min-w-0 items-center gap-0.5 rounded-sm text-left text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden',
                alignRight && 'justify-end'
              )}
            >
              <span className="whitespace-normal">{MOBILE_LABELS[title] || title}</span>
              <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align={alignRight ? 'end' : 'start'}
            collisionPadding={12}
            className="w-64 max-w-[calc(100vw-1.5rem)] p-3 shadow-none"
          >
            <p className="text-sm font-semibold">{title}</p>
            <p className="mb-2 mt-1 whitespace-normal text-sm text-muted-foreground">
              {description}
            </p>
            <div className="flex flex-col gap-1 border-t pt-2">
              <Button
                variant="ghost"
                className="min-h-11 justify-start gap-2"
                aria-pressed={direction === 'asc'}
                onClick={() => column.toggleSorting(false)}
              >
                <ArrowUp className="h-4 w-4" /> Tri croissant
              </Button>
              <Button
                variant="ghost"
                className="min-h-11 justify-start gap-2"
                aria-pressed={direction === 'desc'}
                onClick={() => column.toggleSorting(true)}
              >
                <ArrowDown className="h-4 w-4" /> Tri décroissant
              </Button>
              {direction && (
                <Button
                  variant="ghost"
                  className="min-h-11 justify-start"
                  onClick={() => column.clearSorting()}
                >
                  Effacer le tri
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <div
        className={cn(
          'metric-column-header flex min-w-0 flex-wrap items-center gap-0.5 md:flex-nowrap',
          alignRight && 'justify-end',
          compactMobile && 'hidden md:flex'
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
    </>
  )
}
