'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileSpreadsheet, Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface PortfolioEmptyStateChecklistProps {
  portfolioId: string
  hasTransactions: boolean
  hasCash: boolean
  onAddTransaction: () => void
}

export function PortfolioEmptyStateChecklist({
  portfolioId,
  hasTransactions,
  hasCash,
  onAddTransaction,
}: PortfolioEmptyStateChecklistProps) {
  const storageKey = `boursehorus_dismiss_checklist_${portfolioId}`
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {}
  }

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border border-primary/25 bg-primary/5 text-foreground mb-3 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground shrink-0">Démarrage rapide :</span>
        <span className="text-muted-foreground truncate hidden md:inline">
          Ajoutez vos premières actions ou importez votre fichier de courtier.
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
        <Button
          size="sm"
          onClick={onAddTransaction}
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1 shadow-none"
        >
          <Plus className="h-3 w-3" /> Transaction
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1 bg-background"
        >
          <Link href={`/app/portfolios/${portfolioId}/import`}>
            <FileSpreadsheet className="h-3 w-3 text-blue-500" /> Importer CSV
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          title="Fermer ce guide"
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg ml-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
