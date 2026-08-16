'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Flame,
  TrendingDown,
  Info,
  Zap,
} from 'lucide-react'
import { MarketIndexSparkline } from './MarketIndexSparkline'

interface MarketVixCockpitProps {
  vixQuote?: any
  period: string
}

export function MarketVixCockpit({ vixQuote, period }: MarketVixCockpitProps) {
  const currentVal = vixQuote?.regularMarketPrice ?? 15.0
  const changePercent = vixQuote?.regularMarketChangePercent ?? 0

  let regime = {
    level: 'Normal',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Activity,
    title: 'Volatilité Modérée (15 - 20)',
    description:
      'Le marché évolue dans sa moyenne historique. Risques équilibrés, pas de panique ni d’euphorie excessive.',
    actionAdvice:
      'Poursuivre la stratégie d’investissement programmée (DCA). Surveiller les valorisations individuelles.',
  }

  if (currentVal < 15) {
    regime = {
      level: 'Calme',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: ShieldCheck,
      title: 'Complaisance & Sérénité (< 15)',
      description:
        'Aversion au risque très faible. Les investisseurs sont confiants et le coût des couvertures (options put) est historiquement bas.',
      actionAdvice:
        'Excellent moment pour couvrir son portefeuille à bas coût ou rebalancer sans stress.',
    }
  } else if (currentVal >= 20 && currentVal < 30) {
    regime = {
      level: 'Tension',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      icon: AlertTriangle,
      title: 'Tension & Incertitude (20 - 30)',
      description:
        'Le marché anticipe des mouvements heurtés (chocs macro, résultats, taux). Les fluctuations quotidiennes s’accentuent.',
      actionAdvice:
        'Conserver des liquidités stratégiques et éviter l’effet de levier.',
    }
  } else if (currentVal >= 30) {
    regime = {
      level: 'Panique',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      icon: Flame,
      title: 'Stress Extrême & Panique (> 30)',
      description:
        'Vente forcée et capitulation des investisseurs. Historiquement, ces pics constituent d’excellents points d’entrée moyen/long terme.',
      actionAdvice:
        'Moment opportun pour déployer ses liquidités sur les dossiers de très haute qualité décotés.',
    }
  }

  const RegimeIcon = regime.icon

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* 1. VIX Trend Graph (8 cols) */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs lg:col-span-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
              Historique de Volatilité • Indice VIX
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-foreground">
              {currentVal.toFixed(2)} pts
            </span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-black ${
                changePercent >= 0
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {changePercent >= 0 ? '+' : ''}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Sparkline Graph */}
        <div className="h-[220px] sm:h-[260px] w-full pt-1">
          <MarketIndexSparkline
            key={`VIX_${period}`}
            symbol="^VIX"
            period={period}
          />
        </div>

        {/* Reference Levels Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-bold">
          <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-1.5 text-center">
            <span className="block font-black text-emerald-500">&lt; 15</span>
            <span className="text-[9px] text-muted-foreground">Calme / Complaisant</span>
          </div>
          <div className="rounded border border-amber-500/30 bg-amber-500/5 p-1.5 text-center">
            <span className="block font-black text-amber-500">15 – 20</span>
            <span className="text-[9px] text-muted-foreground">Régime Normal</span>
          </div>
          <div className="rounded border border-orange-500/30 bg-orange-500/5 p-1.5 text-center">
            <span className="block font-black text-orange-500">20 – 30</span>
            <span className="text-[9px] text-muted-foreground">Tension &amp; Risque</span>
          </div>
          <div className="rounded border border-rose-500/30 bg-rose-500/5 p-1.5 text-center">
            <span className="block font-black text-rose-500">&gt; 30</span>
            <span className="text-[9px] text-muted-foreground">Panique / Solde</span>
          </div>
        </div>
      </div>

      {/* 2. Sentiment & Insight Cockpit (4 cols) */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs lg:col-span-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Baromètre Macro
              </span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${regime.bg} ${regime.color}`}>
              {regime.level}
            </span>
          </div>

          {/* Current State Card */}
          <div className={`rounded-lg border p-3 ${regime.bg} ${regime.border}`}>
            <div className="flex items-center gap-2">
              <RegimeIcon className={`h-4 w-4 ${regime.color}`} />
              <span className={`text-xs font-black ${regime.color}`}>
                {regime.title}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
              {regime.description}
            </p>
          </div>

          {/* Actionable Advice */}
          <div className="rounded-lg bg-muted/40 p-3 text-[11px] border border-border/40">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-foreground">
              <Info className="h-3 w-3 text-primary" />
              <span>Conduite recommandée</span>
            </div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              {regime.actionAdvice}
            </p>
          </div>
        </div>

        {/* Market correlation tip */}
        <div className="rounded-lg bg-muted/20 p-2 text-[10px] text-muted-foreground/90 border border-border/30">
          <span className="font-bold text-foreground">💡 Règle d'or : </span>
          Le VIX évolue généralement de façon inverse aux actions. Quand le VIX explose, c'est souvent la fin de la baisse.
        </div>
      </div>
    </div>
  )
}
