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
  isOverlay?: boolean
}

/**
 * Reusable Right Sidebar component.
 * When isOverlay=true (default for standalone drawers like PortfolioAssetDrawer and PortfolioHelpDrawer):
 * Opens as a fixed right-side sliding drawer with a dark backdrop.
 * When isOverlay=false (used in SplitScreenLayout):
 * Displays inline as a split-screen side panel.
 */
export function RightSidebar({
  isOpen,
  onClose,
  title,
  children,
  className,
  width = 'md:w-[540px] lg:w-[640px]',
  isOverlay = true,
}: RightSidebarProps) {
  if (!isOpen) return null

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className={cn(
            'flex flex-col h-full w-full bg-background border-l shadow-2xl animate-in slide-in-from-right duration-300',
            width,
            className
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/10 p-4">
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
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 flex flex-col overflow-y-auto">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-background border-l transition-all duration-300',
        'fixed inset-y-0 right-0 z-50 w-full shadow-2xl animate-in slide-in-from-right',
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
