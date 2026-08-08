'use client'

import React, { useState } from 'react'
import { RightSidebar } from '@/components/organismes/layout/RightSidebar'
import { Input } from '@/components/ui/input'
import {
  HelpCircle,
  Search,
  BookOpen,
  Info,
} from 'lucide-react'

interface PortfolioHelpDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const glossary = [
  {
    term: 'PRU (Prix de Revient Unitaire)',
    tag: 'Base',
    definition:
      'Le prix moyen auquel vous avez acheté vos actions, en incluant l\'ensemble de vos achats successifs et les frais de courtage.',
  },
  {
    term: 'BEP (Break-Even Price / Prix d\'Équilibre)',
    tag: 'Gestion',
    definition:
      'Le cours exact de l\'action au-dessus duquel votre position devient globalement bénéficiaire. Il prend en compte vos liquidités, vos frais et les mouvements passés.',
  },
  {
    term: 'ROIC (Return on Invested Capital)',
    tag: 'Qualité',
    definition:
      'Le rendement du capital investi par l\'entreprise. Un ROIC supérieur à 15% signale une entreprise d\'exception dotée d\'un fort avantage compétitif (Moat).',
  },
  {
    term: 'ROE (Return on Equity)',
    tag: 'Qualité',
    definition:
      'La rentabilité des capitaux propres. Il mesure la capacité des dirigeants à générer des profits avec l\'argent des actionnaires (Cible François Rochon > 18%).',
  },
  {
    term: 'PER 5 Ans (Price Earning Ratio Média)',
    tag: 'Valorisation',
    definition:
      'Le multiple de bénéfices moyen des 5 dernières années. Permet de déterminer si une action est historiquement sous-évaluée ou surévaluée.',
  },
  {
    term: 'Drawdown Maximum',
    tag: 'Risque',
    definition:
      'La perte maximale en pourcentage subie par le portefeuille entre son plus haut historique (sommet) et son plus bas suivant.',
  },
  {
    term: 'Ratio de Sharpe',
    tag: 'Performance',
    definition:
      'Mesure la rentabilité générée par unité de risque prise. Un ratio supérieur à 1 est considéré comme très satisfaisant.',
  },
]

const faqs = [
  {
    question: 'Comment importer mon portefeuille depuis mon courtier (Degiro, Trade Republic, IBKR) ?',
    answer:
      'Allez dans l\'onglet "Importation CSV" de votre portefeuille. Téléchargez le fichier d\'historique des transactions au format CSV/XLSX fourni par votre courtier, puis déposez-le dans la zone d\'importation.',
  },
  {
    question: 'Comment enregistrer un versement de cash ou un retrait ?',
    answer:
      'Cliquez sur le bouton "+ Transaction" puis sélectionnez le type "Dépôt Cash" ou "Retrait Cash". Saisissez le montant et validez.',
  },
  {
    question: 'Pourquoi mon BEP diffère-t-il de mon PRU ?',
    answer:
      'Le PRU ne prend en compte que les prix d\'achat des titres détenus. Le BEP (Break-Even Price) intègre l\'ensemble du flux financier (frais, dividendes perçus et plus-values réalisées passées) pour vous donner votre vrai seuil de rentabilité.',
  },
]

export function PortfolioHelpDrawer({ isOpen, onClose }: PortfolioHelpDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'glossary' | 'faq'>('glossary')

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFaqs = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      width="md:w-[420px] lg:w-[460px]"
      title={
        <div className="flex items-center gap-2 text-sm font-black tracking-tight text-foreground">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span>Aide & Glossaire Financier</span>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un terme (PRU, BEP, ROIC, Import...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs rounded-full border-border/80 bg-muted/20"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-full bg-muted/40 p-1 border border-border/60">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${
              activeTab === 'glossary'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Glossaire ({filteredGlossary.length})
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Faq & Tutoriels ({filteredFaqs.length})
          </button>
        </div>

        {/* Tab 1: Glossary */}
        {activeTab === 'glossary' && (
          <div className="space-y-3">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" /> {item.term}
                  </h4>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {filteredFaqs.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-border/60 bg-card/60 space-y-1.5 shadow-sm"
              >
                <h4 className="text-xs font-bold text-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{item.question}</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </RightSidebar>
  )
}
