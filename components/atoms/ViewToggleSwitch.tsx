'use client'

import * as React from 'react'
import { LayoutDashboard, Table as TableIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewToggleSwitchProps {
  view: 'table' | 'analysis'
  onViewChange: (view: 'table' | 'analysis') => void
  className?: string
}

export function ViewToggleSwitch({ view, onViewChange, className }: ViewToggleSwitchProps) {
  return (
    <div
      className={cn(
        'flex items-center rounded-full bg-muted/60 p-0.5 border border-border/60 text-xs font-bold shrink-0 shadow-inner',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange('table')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 select-none',
          view === 'table'
            ? 'bg-card text-foreground shadow-sm ring-1 ring-border/80 font-extrabold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Vue Tableau de Données"
      >
        <TableIcon className={cn("h-3.5 w-3.5 transition-colors", view === 'table' ? "text-primary" : "text-muted-foreground")} />
        <span className="inline">Tableau</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('analysis')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 select-none',
          view === 'analysis'
            ? 'bg-card text-foreground shadow-sm ring-1 ring-border/80 font-extrabold'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Vue Analyse & Graphiques Synthétiques"
      >
        <LayoutDashboard className={cn("h-3.5 w-3.5 transition-colors", view === 'analysis' ? "text-amber-500" : "text-muted-foreground")} />
        <span className="inline">Analyse</span>
      </button>
    </div>
  )
}
