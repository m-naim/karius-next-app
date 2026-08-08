'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wallet, PieChart, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'

interface PortfolioOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onStartTour: () => void
}

export function PortfolioOnboardingModal({
  isOpen,
  onClose,
  onStartTour,
}: PortfolioOnboardingModalProps) {
  const [step, setStep] = useState(0)

  const slides = [
    {
      icon: Wallet,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: 'Bienvenue sur votre Espace Portefeuille',
      subtitle: 'Suivez la vraie valeur de votre patrimoine en temps réel.',
      description:
        'Visualisez la performance globale de vos investissements, la plus-value latente, le Prix d\'Équilibre (BEP) et votre trésorerie disponible.',
      badge: 'Vision Patrimoniale',
    },
    {
      icon: PieChart,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      title: 'Analyse de Qualité & Ratios Fondamentaux',
      subtitle: 'Ne subissez plus le marché, analysez la qualité de vos lignes.',
      description:
        'Consultez la rentabilité du capital (ROIC), le rendement des fonds propres (ROE) et la valorisation (PER 5 ans) des entreprises que vous possédez.',
      badge: 'Grille de Qualité',
    },
    {
      icon: ShieldCheck,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: 'Outils Avancés & Synchronisation',
      subtitle: 'Tout votre suivi financier réuni au même endroit.',
      description:
        'Importez vos fichiers de courtier (Degiro, Trade Republic, IBKR), suivez votre calendrier de dividendes et votre ratio de Sharpe.',
      badge: 'Gestion Complète',
    },
  ]

  const currentSlide = slides[step]
  const Icon = currentSlide.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl rounded-3xl p-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${currentSlide.color}`}>
              <Sparkles className="h-3 w-3" /> {currentSlide.badge}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {step + 1} sur {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${currentSlide.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground">
                {currentSlide.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                {currentSlide.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-4 rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs font-medium text-muted-foreground leading-relaxed">
          {currentSlide.description}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-1.5 py-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-1.5 rounded-full transition-all ${
                step === index ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          {step < slides.length - 1 ? (
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Passer l'introduction
              </Button>
              <Button
                size="sm"
                onClick={() => setStep(step + 1)}
                className="rounded-full gap-2 text-xs font-bold"
              >
                Suivant <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-full text-xs font-bold"
              >
                Explorer directement
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose()
                  onStartTour()
                }}
                className="rounded-full gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <CheckCircle2 className="h-4 w-4" /> Lancer le Tour Guidé 🚀
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
