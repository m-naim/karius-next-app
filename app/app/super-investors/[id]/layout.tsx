'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  BriefcaseBusiness,
  FileCheck2,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/atoms/BackButton'
import {
  getSuperInvestorById,
  getSuperInvestorValuationStatus,
  InvestorDetail,
  ValuationStatus,
} from '@/services/superInvestorService'

export default function SuperInvestorLayout({
  children,
}: {
  children: ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const slug = params?.id as string
  const [investor, setInvestor] = useState<InvestorDetail | null>(null)
  const [valuation, setValuation] = useState<ValuationStatus | null>(null)

  useEffect(() => {
    if (!slug) return
    getSuperInvestorById(slug)
      .then(setInvestor)
      .catch(() => setInvestor(null))
    getSuperInvestorValuationStatus(slug)
      .then(setValuation)
      .catch(() => setValuation(null))
  }, [slug])

  const root = `/app/super-investors/${slug}`
  const navItems = [
    { name: 'Aperçu', url: root, icon: LayoutDashboard },
    { name: 'Positions', url: `${root}/positions`, icon: BriefcaseBusiness },
    { name: 'Performance', url: `${root}/performance`, icon: BarChart3 },
    { name: 'Déclarations 13F', url: `${root}/filings`, icon: FileCheck2 },
  ]

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-background">
      <div className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:pt-4">
        <SectionContainer>
          <div className="flex min-w-0 flex-col">
            <div className="mb-2 flex min-w-0 items-center justify-between gap-3 sm:mb-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <BackButton
                  fallbackHref="/app/super-investors"
                  label="Retour à la page précédente"
                  className="h-8 w-8"
                />
                <div className="min-w-0">
                  <h1 className="truncate p-0 text-lg font-black tracking-tight text-foreground sm:text-2xl">
                    {investor?.displayName || 'Super Investor'}
                  </h1>
                  {investor?.fundDisplayName && (
                    <p className="mb-0 truncate text-xs font-medium text-muted-foreground">
                      {investor.fundDisplayName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {valuation?.latestCoveragePercent != null && (
                  <Badge variant="outline" className="hidden gap-1.5 sm:flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {valuation.latestCoveragePercent.toFixed(1)} % couvert
                  </Badge>
                )}
                <Badge
                  variant={
                    valuation?.status === 'AVAILABLE' ? 'secondary' : 'outline'
                  }
                >
                  {valuation?.status === 'RUNNING'
                    ? 'Calcul en cours'
                    : valuation?.status === 'INCOMPLETE'
                    ? 'Données partielles'
                    : 'Reconstruction 13F'}
                </Badge>
              </div>
            </div>

            <nav
              className="flex min-w-0 items-center gap-1 overflow-x-auto no-scrollbar"
              aria-label="Navigation Super Investor"
            >
              {navItems.map((item) => {
                const active =
                  pathname === item.url || pathname === `${item.url}/`
                return (
                  <Link key={item.name} href={item.url} className="shrink-0">
                    <span
                      className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-xs transition-colors sm:px-4 sm:text-sm ${
                        active
                          ? 'font-bold text-foreground'
                          : 'font-medium text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <item.icon className="hidden h-4 w-4 sm:block" />
                      {item.name}
                      {active && (
                        <motion.span
                          layoutId={`super-investor-nav-${slug}`}
                          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 32,
                          }}
                        />
                      )}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer>
        <div className="mb-10 mt-4 flex min-w-0 flex-col">{children}</div>
      </SectionContainer>
    </div>
  )
}
