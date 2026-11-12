'use client'

import { Info, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Actions } from 'app/app/watchlist/[id]/components/Actions'
import type { security } from 'app/app/watchlist/[id]/data/security'

export function SecurityIdentity({
  security: stock,
  id,
  owned = false,
  deleteRow,
  allWatchlists = [],
}: {
  security: security
  id?: string
  owned?: boolean
  deleteRow?: (symbol: string) => void
  allWatchlists?: any[]
}) {
  const name = stock.longname || stock.shortname || stock.symbol
  const [symbol, exchange] = stock.symbol.split('.')
  const guruTicker = exchange === 'PA' ? `xpar:${symbol}` : symbol
  const actions = (
    <Actions
      id={id}
      symbol={stock.symbol}
      deleteRow={owned ? deleteRow : undefined}
      allWatchlists={allWatchlists}
      security={stock}
    />
  )

  return (
    <div className="flex min-w-0 items-center gap-0.5 md:max-w-[260px]">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Informations sur ${name} (${stock.symbol})`}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="hidden h-5 w-5 shrink-0 rounded-full bg-white/10 md:block"
              src={`https://financialmodelingprep.com/image-stock/${stock.symbol.toUpperCase()}.png`}
              alt=""
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="line-clamp-2 whitespace-normal break-words text-xs font-semibold leading-tight">
                {name}
              </span>
              <span className="flex flex-wrap items-center gap-1 whitespace-normal text-[10px] font-bold text-muted-foreground">
                <span className="min-w-0 break-all">{stock.symbol}</span>
                <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
              </span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent
          className="bottom-0 left-0 top-auto max-h-[80dvh] w-full translate-x-0 translate-y-0 overflow-y-auto rounded-t-xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] motion-reduce:animate-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          onClick={(event) => event.stopPropagation()}
        >
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="break-words leading-snug">{name}</DialogTitle>
            <DialogDescription>
              {stock.symbol}
              {stock.sector ? ` · ${stock.sector}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <a
              href={`https://www.gurufocus.com/stock/${guruTicker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
            >
              Voir sur GuruFocus <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
      {actions}
    </div>
  )
}
