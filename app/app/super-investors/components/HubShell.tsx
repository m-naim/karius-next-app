'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Database,
  FileCheck2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const links = [
  { href: '/app/super-investors', label: 'Investisseurs' },
  { href: '/app/super-investors/most-owned', label: 'Plus détenues' },
  { href: '/app/super-investors/top-buys', label: 'Renforcements' },
  { href: '/app/super-investors/top-sells', label: 'Allègements' },
]

export function HubShell({
  children,
  total,
  coverage,
  latestDate,
}: {
  children: React.ReactNode
  total?: number
  coverage?: string
  latestDate?: string
}) {
  const pathname = usePathname()
  const formattedDate = latestDate
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
        new Date(`${latestDate}T12:00:00`)
      )
    : null

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-6 md:px-8 md:py-8">
        <header className="rounded-2xl border border-border/70 bg-card px-4 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Données vérifiées SEC
                  EDGAR
                </Badge>
                {formattedDate && (
                  <Badge variant="secondary">
                    Dernière période : {formattedDate}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Super investisseurs
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                Comparez les performances estimées et explorez les positions
                officiellement déclarées dans les formulaires 13F.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center lg:min-w-[440px]">
              <Metric
                icon={Users}
                label="Déclarants"
                value={total == null ? '—' : String(total)}
              />
              <Metric
                icon={Database}
                label="Couverture"
                value={coverage || 'Dès 1 %'}
              />
              <Metric icon={FileCheck2} label="Source" value="SEC 13F" />
            </div>
          </div>
        </header>

        <nav
          aria-label="Vues Super Investors"
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative shrink-0 px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground',
                  active &&
                    'text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {children}

        <aside className="flex items-start gap-3 rounded-lg bg-muted/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Les 13F sont publiés avec retard et ne couvrent pas forcément les
            liquidités, ventes à découvert, obligations ou titres étrangers. Une
            faible couverture rend la performance moins représentative.
          </p>
        </aside>
      </div>
    </main>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-background px-2 py-2.5">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-xs font-black">{value}</p>
    </div>
  )
}
