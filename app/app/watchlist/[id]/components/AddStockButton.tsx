'use client'

import * as React from 'react'
import { PlusIcon, CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { search } from 'services/stock.service'

type securityInfos = {
  symbol: string
  exchange: string
  longname: string
}
export function AddStockButton({ addRow }) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [options, setOptions] = React.useState<securityInfos[]>([])

  const fetchValues = async (value) => {
    if (value.length > 2) {
      const res = await search(value)
      setOptions(res)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          role="combobox"
          aria-expanded={open}
          className=" justify-between"
        >
          <PlusIcon className="h-4 w-4 shrink-0 opacity-50" /> Ajouter une valeur
        </Button>
      </PopoverTrigger>

      <PopoverContent className="ml-16 w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Checher par symbol ou nom (AAPL,MSFT)..."
            className="h-9"
            onValueChange={fetchValues}
          />
          <CommandEmpty>valeur introuvable.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.symbol}
                value={option.symbol}
                onSelect={(currentValue) => {
                  addRow(option)
                  setValue(currentValue === value ? '' : currentValue)
                  setOpen(false)
                  setOptions([])
                }}
              >
                {option.symbol}.{option.exchange} : {option.longname}
                <CheckIcon
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === option.symbol ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
