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
import stockService from '@/services/stock.service'
import { useDebouncedCallback } from 'use-debounce'

interface Security {
  quoteType: string
  symbol: string
  shortname: string
  exchange: string
}

export function ComboboxPopover({ ticker, setTicker }) {
  const [open, setOpen] = React.useState(false)
  const [data, setData] = React.useState<Security[]>([])

  const fetchData = async (value) => {
    if (value.lenght < 1) return
    try {
      const res: Security[] = await stockService.search(value as string)
      setData(res)
    } catch (e) {
      console.log('error api:' + e)
    }
  }

  const handler = useDebouncedCallback(fetchData, 300)

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[250px] justify-start">
            {ticker ? <>{ticker}</> : <>+ chercher une valeur</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="center">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Change status..." onValueChange={handler} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Actions">
                {data
                  .filter((security) => security.quoteType === 'EQUITY')
                  .map((security) => item(security, setTicker, setOpen))}
              </CommandGroup>
              <CommandSeparator />

              <CommandGroup heading="ETFs">
                {data
                  .filter((security) => security.quoteType === 'ETF')
                  .map((security) => item(security, setTicker, setOpen))}
              </CommandGroup>

              <CommandGroup heading="Crypto">
                {data
                  .filter((security) => security.quoteType === 'CRYPTOCURRENCY')
                  .map((security) => item(security, setTicker, setOpen))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const item = (security: Security, setTicker, setOpen) => (
  <CommandItem
    key={security.symbol}
    value={security.symbol}
    onSelect={(value) => {
      setTicker(value.toUpperCase())
      setOpen(false)
    }}
  >
    {security.symbol} | {security.shortname} | {security.exchange}
  </CommandItem>
)
