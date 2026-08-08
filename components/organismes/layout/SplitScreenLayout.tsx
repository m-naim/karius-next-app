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
  isFixedLayout?: boolean
}

/**
 * Shared Split Screen Layout component.
 * Supports fixed h-full viewport for Watchlist & Market Ticker detail views,
 * and normal scrollable viewports for standard pages.
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
  isFixedLayout = false,
}: SplitScreenLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row w-full flex-1',
        isFixedLayout
          ? 'h-full overflow-hidden'
          : 'h-auto min-h-screen overflow-y-auto',
        className
      )}
    >
      {/* LEFT PANE: Header, Filters & Table/Main view */}
      <div
        className={cn(
          'flex flex-1 min-w-0 flex-col gap-2 p-2 md:gap-3 md:p-3',
          isFixedLayout
            ? 'h-full min-h-0 overflow-hidden'
            : 'h-auto min-h-0 overflow-y-auto'
        )}
      >
        {header && <div className="shrink-0">{header}</div>}
        {filters && <div className="shrink-0">{filters}</div>}

        <div
          className={cn(
            'bg-dark flex-1 min-w-0 rounded-xl border',
            isFixedLayout ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          <div
            className={cn(
              'flex h-full flex-col min-h-0',
              isFixedLayout ? 'overflow-hidden' : 'overflow-y-auto'
            )}
          >
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
