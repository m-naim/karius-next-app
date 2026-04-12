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
 * On mobile, it behaves like an overlay (fixed).
 * On desktop (md+), it can be used inside a flex container to push content or stay fixed.
 */
export function RightSidebar({
  isOpen,
  onClose,
  title,
  children,
  className,
  width = 'md:w-[500px] lg:w-[600px]',
}: RightSidebarProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-[60] flex flex-col border-l bg-background shadow-2xl duration-300 animate-in slide-in-from-right md:shadow-none',
        'w-full', // mobile full width
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

      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  )
}
