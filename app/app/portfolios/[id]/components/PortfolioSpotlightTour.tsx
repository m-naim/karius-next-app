'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft, Check, Sparkles, HelpCircle } from 'lucide-react'

interface TourStep {
  targetId: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const steps: TourStep[] = [
  {
    targetId: 'tour-stats-card',
    title: '1. Synthèse du Capital & Liquidités',
    description:
      'Retrouvez ici la valeur totale de votre portefeuille, votre trésorerie (Cash), ainsi que votre plus-value globale et du jour.',
    position: 'bottom',
  },
  {
    targetId: 'tour-table-section',
    title: '2. Tableau d\'Allocation des Lignes',
    description:
      'Consultez vos positions d\'actions avec leur Poids (%), Prix Moyen d\'Achat (PRU), Prix d\'Équilibre (BEP) et rentabilité (ROIC).',
    position: 'top',
  },
  {
    targetId: 'tour-quick-actions',
    title: '3. Actions Rapides',
    description:
      'Utilisez ces boutons pour ajouter une nouvelle transaction (Achat/Vente) ou effectuer un versement/retrait de trésorerie.',
    position: 'bottom',
  },
  {
    targetId: 'tour-subnav-links',
    title: '4. Vues & Outils Avancés',
    description:
      'Naviguez vers l\'historique des Transactions, l\'Analyse de Performance (Ratio de Sharpe), les Dividendes et l\'Importation CSV.',
    position: 'bottom',
  },
  {
    targetId: 'tour-help-button',
    title: '5. Assistant & Glossaire Financier',
    description:
      'Besoin d\'aide sur un terme (BEP, PRU, ROIC) ou d\'un tutoriel ? Cliquez à tout moment sur ce bouton d\'aide.',
    position: 'left',
  },
]

interface PortfolioSpotlightTourProps {
  isActive: boolean
  onClose: () => void
}

export function PortfolioSpotlightTour({ isActive, onClose }: PortfolioSpotlightTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  if (!isActive) return null

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="relative max-w-md w-full border border-primary/40 bg-card/95 shadow-2xl backdrop-blur-xl rounded-3xl p-6 text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Visite Guidée du Portefeuille</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary border border-primary/30">
                {currentStepIndex + 1}
              </span>
              <h3 className="text-base font-black text-foreground">
                {currentStep.title}
              </h3>
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed pl-8">
              {currentStep.description}
            </p>
          </div>

          {/* Indicators & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStepIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="rounded-full text-xs font-bold gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Précédent
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="rounded-full text-xs font-bold gap-1 shadow-md"
              >
                {isLastStep ? (
                  <>Terminer <Check className="h-3.5 w-3.5" /></>
                ) : (
                  <>Suivant <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
