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
import { ComboboxPopover } from '@/components/ui/comboBox'

type securityInfos = {
  symbol: string
  exchange: string
  longname: string
}
export function AddStockButton({ addRow }) {
  const [value, setValue] = React.useState('')

  const setTicker = (ticker) => {
    setValue('')
    addRow(ticker)
  }

  return <ComboboxPopover ticker={value} setTicker={setTicker} className="col-span-3 w-full" />
}
