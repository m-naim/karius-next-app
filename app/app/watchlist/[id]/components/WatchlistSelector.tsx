'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Watchlist {
  _id: string
  name: string
}

interface WatchlistSelectorProps {
  watchlists: Watchlist[]
  currentId: string
}

export function WatchlistSelector({ watchlists, currentId }: WatchlistSelectorProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const frameworks = watchlists.map((w) => ({
    value: w._id,
    label: w.name,
  }))

  const currentValue = frameworks.find((f) => f.value === currentId)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentValue || 'Select a watchlist...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search watchlist..." />
          <CommandList>
            <CommandEmpty>No watchlist found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.label}
                  onSelect={(currentLabel) => {
                    const selectedFramework = frameworks.find(
                      (f) => f.label.toLowerCase() === currentLabel.toLowerCase()
                    )
                    if (selectedFramework) {
                      router.push(`/app/watchlist/${selectedFramework.value}`)
                    }
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentId === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {framework.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
