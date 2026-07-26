'use client'

import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RightSidebarProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  width?: string
}

/**
 * Reusable Right Sidebar component.
 * On mobile, it behaves like an overlay drawer (fixed).
 * On desktop (md+), it sits inline in a split-screen flex layout next to the main content panel.
 */
export function RightSidebar({
  isOpen,
  onClose,
  title,
  children,
  className,
  width = 'md:w-[480px] lg:w-[560px] xl:w-[620px]',
}: RightSidebarProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'flex flex-col bg-background border-l transition-all duration-300',
        // Mobile layout: fixed overlay drawer
        'fixed inset-y-0 right-0 z-50 w-full shadow-2xl animate-in slide-in-from-right',
        // Desktop layout: relative panel in split screen layout
        'md:relative md:inset-auto md:z-10 md:h-full md:shrink-0 md:shadow-none md:animate-in md:fade-in-50 md:slide-in-from-right-5',
        width,
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b bg-muted/5 p-4">
        <div className="min-w-0 flex-1">
          {typeof title === 'string' ? (
            <h2 className="truncate text-lg font-black uppercase tracking-tight text-primary">
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 rounded-full hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 flex flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
