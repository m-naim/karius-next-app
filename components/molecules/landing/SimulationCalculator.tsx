'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Calculator,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { round10 } from '@/lib/decimalAjustement'

export function SimulationCalculator() {
  const [initialCapital, setInitialCapital] = useState(5000)
  const [monthlyContribution, setMonthlyContribution] = useState(300)
  const [annualReturn, setAnnualReturn] = useState(8.5)
  const [years, setYears] = useState(15)

  // Calcul du capital final et des intérêts composés
  const { totalInvested, finalBalance, totalInterest, yearlyData } = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12
    const totalMonths = years * 12

    let balance = initialCapital
    let invested = initialCapital
    const points: { year: number; balance: number; invested: number }[] = []

    points.push({ year: 0, balance: initialCapital, invested: initialCapital })

    for (let m = 1; m <= totalMonths; m++) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate)
      invested += monthlyContribution

      if (m % 12 === 0) {
        points.push({
          year: m / 12,
          balance: Math.round(balance),
          invested: Math.round(invested),
        })
      }
    }

    return {
      totalInvested: Math.round(invested),
      finalBalance: Math.round(balance),
      totalInterest: Math.round(balance - invested),
      yearlyData: points,
    }
  }, [initialCapital, monthlyContribution, annualReturn, years])

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Max value for SVG scaling
  const maxVal = Math.max(...yearlyData.map((d) => d.balance), 1)

  return (
    <div className="w-full max-w-5xl mx-auto my-12 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl shadow-primary/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
            <Calculator className="h-3.5 w-3.5" />
            <span>Simulateur d&apos;Intérêts Composés en Direct</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            Projetez la croissance de votre portefeuille
          </h3>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-muted-foreground font-medium">Hypothèse de rendement historique</span>
          <div className="text-sm font-extrabold text-emerald-500 flex items-center justify-end gap-1">
            <TrendingUp className="h-4 w-4" /> S&amp;P 500 (~8.5% / an)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SLIDERS & CONTROLS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Slider 1: Capital Initial */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted-foreground">Capital Initial</span>
              <span className="text-foreground text-sm font-black tabular-nums">{formatEuro(initialCapital)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>0 €</span>
              <span>50 000 €</span>
            </div>
          </div>

          {/* Slider 2: Epargne Mensuelle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted-foreground">Épargne Mensuelle</span>
              <span className="text-foreground text-sm font-black tabular-nums">{formatEuro(monthlyContribution)} / mois</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>0 €</span>
              <span>2 000 € / mois</span>
            </div>
          </div>

          {/* Slider 3: Rendement Annuel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted-foreground">Rendement Annuel Estimé</span>
              <span className="text-emerald-500 text-sm font-black tabular-nums">{annualReturn}% / an</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>2% (Livret A)</span>
              <span>15% (Growth)</span>
            </div>
          </div>

          {/* Slider 4: Horizon d'Investissement */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted-foreground">Horizon (Années)</span>
              <span className="text-foreground text-sm font-black tabular-nums">{years} ans</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>1 ans</span>
              <span>35 ans</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS & INTERACTIVE CHART */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Investi</span>
              <div className="text-sm sm:text-base font-extrabold text-foreground tabular-nums">{formatEuro(totalInvested)}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Intérêts Générés</span>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatEuro(totalInterest)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary">Valeur Finale</span>
              <div className="text-base sm:text-lg font-black text-primary tabular-nums">{formatEuro(finalBalance)}</div>
            </div>
          </div>

          {/* SVG Projections Chart */}
          <div className="h-48 w-full rounded-2xl bg-background border border-border/60 p-4 relative flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold z-10">
              <span>Projection du Patrimoine sur {years} ans</span>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                Effet Boule de Neige
              </span>
            </div>

            <div className="relative h-32 w-full mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                {/* Total Invested line */}
                <path
                  d={`M ${yearlyData
                    .map(
                      (d, i) =>
                        `${(i / (yearlyData.length - 1)) * 100},${
                          50 - (d.invested / maxVal) * 45
                        }`
                    )
                    .join(' L ')}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />

                {/* Compound Interest Line */}
                <path
                  d={`M ${yearlyData
                    .map(
                      (d, i) =>
                        `${(i / (yearlyData.length - 1)) * 100},${
                          50 - (d.balance / maxVal) * 45
                        }`
                    )
                    .join(' L ')}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Area under curve */}
                <path
                  d={`M 0,50 L ${yearlyData
                    .map(
                      (d, i) =>
                        `${(i / (yearlyData.length - 1)) * 100},${
                          50 - (d.balance / maxVal) * 45
                        }`
                    )
                    .join(' L ')} L 100,50 Z`}
                  fill="#10b981"
                  fillOpacity="0.12"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 z-10 border-t border-border/40">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Versements
              </span>
              <span className="flex items-center gap-1 font-bold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Capital avec Intérêts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
