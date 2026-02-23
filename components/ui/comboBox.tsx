'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { search } from '@/services/stock.service'
import { useDebouncedCallback } from 'use-debounce'
import { cn } from '@/lib/utils'
import SecurityImage from '@/components/atoms/SecurityImage'
interface Security {
  quoteType: string
  symbol: string
  shortname: string
  exchange: string
  longname?: string
  fullExchangeName: string
}

export function StockSearchCommand({ onSelect }: { onSelect: (value: string) => void }) {
  const [data, setData] = React.useState<Security[]>([])

  const fetchData = async (value) => {
    if (value.length < 1) {
      setData([])
      return
    }

    try {
      const res: Security[] = await search(value as string)
      setData(res)
    } catch (e) {
      console.error('error api:' + e)
    }
  }

  const handler = useDebouncedCallback(fetchData, 300)

  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder="Change status..." onValueChange={handler} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {data
            .filter((security) => security.quoteType === 'EQUITY')
            .map((security) => (
              <CommandItem
                key={security.symbol}
                value={security.symbol}
                onSelect={(value) => onSelect(value.toUpperCase())}
              >
                <div className="flex items-center gap-x-2">
                  <SecurityImage symbol={security.symbol} />
                  <div className="flex flex-col">
                    <span className="font-medium">{security.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {security.longname || security.shortname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {security.fullExchangeName}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="ETFs">
          {data
            .filter((security) => security.quoteType === 'ETF')
            .map((security) => (
              <CommandItem
                key={security.symbol}
                value={security.symbol}
                onSelect={(value) => onSelect(value.toUpperCase())}
              >
                {security.symbol} | {security.longname || security.shortname} | {security.exchange}{' '}
                ({security.quoteType})
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandGroup heading="Crypto">
          {data
            .filter((security) => security.quoteType === 'CRYPTOCURRENCY')
            .map((security) => (
              <CommandItem
                key={security.symbol}
                value={security.symbol}
                onSelect={(value) => onSelect(value.toUpperCase())}
              >
                {security.symbol} | {security.longname || security.shortname} | {security.exchange}{' '}
                ({security.quoteType})
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function ComboboxPopover({
  ticker,
  setTicker,
  className,
}: {
  ticker: string
  setTicker: (ticker: string) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('min-w-[250px] justify-start', className)}>
          {ticker ? <>{ticker}</> : <>+ chercher une valeur</>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('min-w-[330px] p-0', className)} side="bottom" align="center">
        <StockSearchCommand
          onSelect={(value) => {
            setTicker(value)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
