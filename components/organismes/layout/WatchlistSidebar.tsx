'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Star,
  LayoutDashboard,
  Clock,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import watchListService from '@/services/watchListService'
import { useAuth } from '@/hooks/useAuth'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface WatchlistSummary {
  _id: string
  name: string
  securities?: any[]
}

export default function WatchlistSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [watchlists, setWatchlists] = useState<WatchlistSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  // Only show on /app related routes or for authenticated users
  const isAppRoute = pathname?.startsWith('/app')

  useEffect(() => {
    if (user && isAppRoute) {
      fetchWatchlists()
    }
  }, [user, isAppRoute])

  const fetchWatchlists = async () => {
    setLoading(true)
    try {
      const data = await watchListService.getAll()
      setWatchlists(data)
    } catch (error) {
      console.error('Failed to fetch watchlists for sidebar:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !isAppRoute) return null

  const filteredWatchlists = watchlists.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div
      className={cn(
        'relative z-40 flex flex-col border-r bg-muted/10 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-10 z-50 h-6 w-6 rounded-full border bg-background shadow-sm transition-colors hover:bg-primary hover:text-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {!isCollapsed ? (
          <>
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-tighter text-slate-500">
              <ListTodo className="h-4 w-4 text-primary" /> MES WATCHLISTS
            </h2>
            <Link href="/app/watchlist/new">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/app/watchlist">
                <ListTodo className="h-5 w-5 text-primary" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Toutes les watchlists</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="mb-4 px-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-none bg-background/50 pl-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Watchlist List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {loading && !isCollapsed && (
            <div className="animate-pulse px-4 py-2 text-xs text-muted-foreground">
              Chargement...
            </div>
          )}

          {filteredWatchlists.map((wl) => {
            const isActive = pathname === `/app/watchlist/${wl._id}`

            return (
              <Tooltip key={wl._id} delayDuration={isCollapsed ? 0 : 500}>
                <TooltipTrigger asChild>
                  <Link href={`/app/watchlist/${wl._id}`}>
                    <div
                      className={cn(
                        'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-600 hover:bg-muted hover:text-slate-900',
                        isCollapsed && 'justify-center px-0'
                      )}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive
                            ? 'fill-white text-white'
                            : 'text-slate-400 group-hover:text-amber-500'
                        )}
                      />
                      {!isCollapsed && (
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-xs font-bold leading-tight">
                            {wl.name}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] opacity-70',
                              isActive ? 'text-white' : 'text-muted-foreground'
                            )}
                          >
                            {wl.securities?.length || 0} valeurs
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{wl.name}</TooltipContent>}
              </Tooltip>
            )
          })}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className={cn('mt-auto border-t p-2', isCollapsed && 'flex flex-col items-center')}>
        <Tooltip delayDuration={isCollapsed ? 0 : 500}>
          <TooltipTrigger asChild>
            <Link href="/app/watchlist">
              <Button
                variant="ghost"
                className={cn(
                  'h-9 w-full justify-start gap-3 px-3',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs font-medium">Dashboard</span>}
              </Button>
            </Link>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">Dashboard</TooltipContent>}
        </Tooltip>

        <Tooltip delayDuration={isCollapsed ? 0 : 500}>
          <TooltipTrigger asChild>
            <Link href="/app/alerts">
              <Button
                variant="ghost"
                className={cn(
                  'h-9 w-full justify-start gap-3 px-3',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <Clock className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs font-medium">Historique Alertes</span>}
              </Button>
            </Link>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">Alertes</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  )
}
