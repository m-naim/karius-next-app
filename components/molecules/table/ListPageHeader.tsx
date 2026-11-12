'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ViewToggleSwitch } from '@/components/atoms/ViewToggleSwitch'

export function ListPageHeader({
  backHref,
  title,
  view,
  onViewChange,
  children,
}: {
  backHref: string
  title: React.ReactNode
  view: 'table' | 'analysis'
  onViewChange: (view: 'table' | 'analysis') => void
  children: React.ReactNode
}) {
  const [mobile, setMobile] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <div className="bg-dark flex min-w-0 shrink-0 flex-col gap-2 rounded-lg border p-2 md:flex-row md:items-center md:justify-between md:gap-4 md:p-4">
      <div className="flex min-w-0 flex-1 items-start gap-2 md:items-center">
        <Button variant="ghost" size="icon" asChild className="h-11 w-9 shrink-0 md:h-8 md:w-8">
          <Link href={backHref} aria-label="Retour à la liste">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">{title}</div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <ViewToggleSwitch
          view={view}
          onViewChange={onViewChange}
          className="[&_button]:min-h-11 md:[&_button]:min-h-0"
        />
        {mobile ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                aria-label="Actions de la liste"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              collisionPadding={12}
              aria-label="Actions de la liste"
              className="list-action-menu flex w-64 max-w-[calc(100vw-1.5rem)] flex-col gap-1 p-2 shadow-none"
            >
              {children}
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  )
}
