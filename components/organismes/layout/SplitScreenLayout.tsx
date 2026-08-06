'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { RightSidebar } from './RightSidebar'

interface SplitScreenLayoutProps {
  header?: React.ReactNode
  filters?: React.ReactNode
  children: React.ReactNode
  showDrawer: boolean
  onCloseDrawer: () => void
  drawerTitle?: React.ReactNode
  drawerContent: React.ReactNode
  className?: string
  drawerWidth?: string
}

/**
 * Shared Split Screen Layout component.
 * Used across Watchlist, Market, and other views to provide a unified,
 * scrollable main pane (with sticky headers and internal table scroll)
 * side-by-side with a split drawer panel.
 */
export function SplitScreenLayout({
  header,
  filters,
  children,
  showDrawer,
  onCloseDrawer,
  drawerTitle,
  drawerContent,
  className,
  drawerWidth,
}: SplitScreenLayoutProps) {
  return (
    <div className={cn('flex h-auto md:h-full w-full min-h-0 flex-1 overflow-y-auto md:overflow-hidden', className)}>
      {/* LEFT PANE: Header, Filters & Table/Main view */}
      <div className="flex flex-1 min-w-0 flex-col h-auto md:h-full min-h-0 gap-2 p-2 md:gap-3 md:p-3 overflow-y-auto md:overflow-hidden">
        {header && <div className="shrink-0">{header}</div>}
        {filters && <div className="shrink-0">{filters}</div>}

        <div className="bg-dark flex-1 min-w-0 overflow-y-auto md:overflow-hidden rounded-xl border">
          <div className="flex h-full flex-col min-h-0 overflow-y-auto md:overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Split Drawer */}
      <RightSidebar
        isOpen={showDrawer}
        onClose={onCloseDrawer}
        title={drawerTitle}
        width={drawerWidth}
      >
        {drawerContent}
      </RightSidebar>
    </div>
  )
}
