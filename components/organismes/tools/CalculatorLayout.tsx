'use client'

import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalculatorChartsContext } from './DeferredCalculatorCharts'

const desktopQuery = '(min-width: 1024px)'
const subscribeDesktop = (notify: () => void) => {
  const media = window.matchMedia(desktopQuery)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const desktopSnapshot = () => window.matchMedia(desktopQuery).matches
const serverSnapshot = () => false
const hydratedSnapshot = () => true
const subscribeHydration = () => () => {}

/** Keep input sections mounted so drafts and expanded settings survive view changes. */
export default function CalculatorLayout({
  parameters,
  results,
  valid,
  resultsLabel,
  actions,
}: {
  parameters: ReactNode
  results: ReactNode
  valid: boolean
  resultsLabel: string
  actions?: ReactNode
}) {
  const [view, setView] = useState('parameters')
  const isDesktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot)
  const hydrated = useSyncExternalStore(subscribeHydration, hydratedSnapshot, serverSnapshot)
  const root = useRef<HTMLDivElement>(null)
  const parametersTab = useRef<HTMLButtonElement>(null)
  const resultsTab = useRef<HTMLButtonElement>(null)
  const selectedView = valid ? view : 'parameters'

  const changeView = (next: string, focusTab = false) => {
    if (next === 'results' && !valid) return
    setView(next)
    // Wait for the panel to change height before positioning it under the site header.
    requestAnimationFrame(() => {
      if (!root.current) return
      if (focusTab)
        (next === 'results' ? resultsTab : parametersTab).current?.focus({ preventScroll: true })
      const header = document.querySelector('main')?.previousElementSibling
      const headerHeight = header?.getBoundingClientRect().height ?? 80
      window.scrollTo({
        top: Math.max(
          0,
          root.current.getBoundingClientRect().top + window.scrollY - headerHeight - 8
        ),
        behavior: 'instant',
      })
    })
  }

  return (
    <Tabs ref={root} value={selectedView} onValueChange={changeView} className="min-w-0">
      <noscript>
        <style>{'[data-calculator-navigation] { display: none !important; }'}</style>
        <p className="rounded-lg border p-4 text-sm">
          Les résultats ci-dessous correspondent aux paramètres affichés. Activez JavaScript pour
          modifier la simulation et afficher les graphiques.
        </p>
      </noscript>
      <div data-calculator-navigation className="sticky top-20 z-30 bg-background py-2 lg:hidden">
        <TabsList aria-label="Vues du simulateur" className="flex h-auto w-full">
          <TabsTrigger ref={parametersTab} value="parameters" className="min-h-11 flex-1 text-base">
            Paramètres
          </TabsTrigger>
          <TabsTrigger
            ref={resultsTab}
            value="results"
            disabled={!valid}
            className="min-h-11 flex-1 text-base"
          >
            Résultats
          </TabsTrigger>
        </TabsList>
      </div>
      {actions}
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <TabsContent
          value="parameters"
          forceMount
          className={`mt-0 min-w-0 lg:col-span-4 ${
            hydrated ? 'data-[state=inactive]:hidden lg:data-[state=inactive]:block' : ''
          }`}
        >
          {parameters}
          <div data-calculator-navigation className="mt-5 space-y-2 lg:hidden">
            {!valid && (
              <p role="status" className="mb-0 text-sm text-destructive">
                Complétez ou corrigez les champs signalés pour accéder aux résultats.
              </p>
            )}
            <Button
              className="min-h-12 w-full whitespace-normal text-base"
              disabled={!valid}
              onClick={() => changeView('results', true)}
            >
              {resultsLabel} <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </div>
        </TabsContent>
        <TabsContent
          value="results"
          forceMount
          className={`mt-0 min-w-0 lg:col-span-8 ${
            hydrated ? 'data-[state=inactive]:hidden lg:data-[state=inactive]:block' : ''
          }`}
        >
          <Button
            variant="outline"
            data-calculator-navigation
            className="mb-4 min-h-11 w-full text-base lg:hidden"
            onClick={() => changeView('parameters', true)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Modifier mes paramètres
          </Button>
          <CalculatorChartsContext.Provider
            value={hydrated && (isDesktop || selectedView === 'results')}
          >
            {results}
          </CalculatorChartsContext.Provider>
        </TabsContent>
      </div>
    </Tabs>
  )
}
