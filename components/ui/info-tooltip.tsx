'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Information can be hovered with a mouse or opened with a tap / keyboard. */
export function InfoTooltip({
  content,
  label,
  children,
  className,
}: {
  content: React.ReactNode
  label: string
  children?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const openOnHover = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    cancelClose()
    setOpen(true)
  }
  const closeOnLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }
  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    []
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Informations : ${label}`}
          className={cn(
            'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:min-h-6 md:min-w-6',
            className
          )}
          onPointerEnter={openOnHover}
          onPointerLeave={closeOnLeave}
          onClick={(event) => event.stopPropagation()}
        >
          {children || <Info className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        collisionPadding={12}
        aria-label={`Informations : ${label}`}
        className="w-max max-w-[min(20rem,calc(100vw-1.5rem))] whitespace-normal break-words border-border p-3 text-sm leading-relaxed shadow-none motion-reduce:animate-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}
