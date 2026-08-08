'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Plus, FileSpreadsheet, Wallet, Sparkles, ArrowRight } from 'lucide-react'
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
  const steps = [
    {
      title: 'Enregistrer votre 1ère transaction ou importer un fichier CSV',
      description: 'Ajoutez vos premières actions manuelles ou déposez votre relevé Degiro / Trade Republic / IBKR.',
      done: hasTransactions,
      action: (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onAddTransaction} className="rounded-full text-xs font-bold gap-1">
            <Plus className="h-3.5 w-3.5" /> Saisir Transaction
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1">
            <Link href={`/app/portfolios/${portfolioId}/import`}>
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" /> Importer CSV
            </Link>
          </Button>
        </div>
      ),
    },
    {
      title: 'Ajuster votre solde de trésorerie disponible (Cash)',
      description: 'Indiquez votre liquidité disponible non investie pour calculer votre vraie performance globale.',
      done: hasCash,
      action: (
        <Button size="sm" variant="outline" onClick={onAddTransaction} className="rounded-full text-xs font-bold gap-1">
          <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Enregistrer Déposer Cash
        </Button>
      ),
    },
    {
      title: 'Explorer la répartition & vos ratios de qualité',
      description: 'Analysez automatiquement le ROIC et la valorisation (PER 5A) de votre portefeuille.',
      done: hasTransactions,
      action: (
        <Button asChild variant="secondary" size="sm" className="rounded-full text-xs font-bold gap-1">
          <Link href={`/app/portfolios/${portfolioId}/performance`}>
            Analyser Performance <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ),
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card shadow-lg backdrop-blur-md rounded-2xl mb-6">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Guide de Démarrage Rapide</span>
            </div>
            <h3 className="text-lg font-black text-foreground mt-0.5">
              Configuration de votre Portefeuille ({progressPercent}%)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground">{completedCount}/3 complété</span>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                step.done
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-muted-foreground'
                  : 'bg-card border-border/80 text-foreground shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-bold ${step.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>

              {!step.done && <div className="shrink-0 pl-8 sm:pl-0">{step.action}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
