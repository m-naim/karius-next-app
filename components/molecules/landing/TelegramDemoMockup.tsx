'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bell,
  CheckCheck,
  TrendingUp,
  Coins,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Zap,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sampleNotifications = [
  {
    id: 'alert1',
    type: 'price',
    title: '🚀 ALERTE PRIX FRANCHI',
    time: '14:32',
    icon: TrendingUp,
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    message: 'NVIDIA (NVDA) vient de franchir votre seuil à la hausse à 128.45 $ (+4.82% aujourd\'hui).',
    details: 'Objectif de hausse atteint • Volume supérieur à la moyenne (+35%)',
  },
  {
    id: 'alert2',
    type: 'dividend',
    title: '💰 VERSEMENT DE DIVIDENDE',
    time: '09:15',
    icon: Coins,
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    message: 'TotalEnergies SE (TTE.PA) a versé votre dividende trimestriel de 0.79 € / action.',
    details: 'Montant crédité : +158.00 € sur votre PEA (200 actions déténues)',
  },
  {
    id: 'alert3',
    type: 'weekly',
    title: '📊 RÉSUMÉ HEBDOMADAIRE PORTEFEUILLE',
    time: 'Dimanche 18:00',
    icon: Bell,
    badgeColor: 'bg-primary/10 text-primary border-primary/30',
    message: 'Votre portefeuille "PEA Growth" a clôturé la semaine à +2.45% (+1 180.50 €).',
    details: 'Top performeur : LVMH (+3.2%) • Valeur totale : 48 250 €',
  },
]

export function TelegramDemoMockup() {
  const [activeNotifId, setActiveNotifId] = useState('alert1')

  const currentNotif = sampleNotifications.find((n) => n.id === activeNotifId) || sampleNotifications[0]

  return (
    <div className="w-full max-w-4xl mx-auto my-12 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl shadow-primary/10">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#24A1DE]/10 px-3.5 py-1 text-xs font-bold text-[#24A1DE]">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Démo Interactive Bot Telegram Boursehorus</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Testez l&apos;envoi d&apos;alertes sur votre téléphone
        </h3>
        <p className="text-xs text-muted-foreground">
          Cliquez sur un type d&apos;alerte ci-dessous pour voir le message reçu instantanément dans Telegram.
        </p>
      </div>

      {/* Alert Type Switcher Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveNotifId('alert1')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border',
            activeNotifId === 'alert1'
              ? 'bg-[#24A1DE] border-[#24A1DE] text-white shadow-md'
              : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Alerte Seuil de Prix</span>
        </button>

        <button
          onClick={() => setActiveNotifId('alert2')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border',
            activeNotifId === 'alert2'
              ? 'bg-[#24A1DE] border-[#24A1DE] text-white shadow-md'
              : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Coins className="h-3.5 w-3.5" />
          <span>Rapport Dividendes</span>
        </button>

        <button
          onClick={() => setActiveNotifId('alert3')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border',
            activeNotifId === 'alert3'
              ? 'bg-[#24A1DE] border-[#24A1DE] text-white shadow-md'
              : 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Résumé Hebdomadaire</span>
        </button>
      </div>

      {/* TELEGRAM MOBILE SCREEN MOCKUP */}
      <div className="w-full max-w-md mx-auto rounded-3xl border-4 border-muted/80 bg-[#0e1621] p-4 text-white shadow-2xl overflow-hidden font-sans">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#24A1DE] flex items-center justify-center font-black text-white text-sm shadow-md">
              BH
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <span>Boursehorus Bot</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#24A1DE] fill-[#24A1DE]/20" />
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">bot • en ligne</span>
            </div>
          </div>
          <span className="text-[10px] text-white/50">{currentNotif.time}</span>
        </div>

        {/* Message Bubble Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNotif.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-[#182533] rounded-2xl p-4 border border-white/10 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#64b5f6] flex items-center gap-1.5">
                <currentNotif.icon className="h-4 w-4" />
                {currentNotif.title}
              </span>
              <span className="text-[10px] text-white/40">{currentNotif.time}</span>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {currentNotif.message}
            </p>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 space-y-1">
              <span>{currentNotif.details}</span>
            </div>

            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 pt-1">
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Délivré en &lt; 1 seconde</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Telegram Input Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>Envoyez /start pour activer...</span>
          <Send className="h-4 w-4 text-[#24A1DE]" />
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground font-medium">
        ⚡ Reçevez vos alertes instantanément sur PC, Mac, iPhone et Android sans installer d&apos;application supplémentaire.
      </div>
    </div>
  )
}
