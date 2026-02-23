'use client'

import * as React from 'react'
import { Check, PlusCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'

interface MultiSelectTagDropdownProps {
  selectedTags: string[]
  allAvailableTags: string[]
  onTagsChange: (newTags: string[]) => void
  onAddGlobalTag: (newTag: string) => void
}

const MultiSelectTagDropdown: React.FC<MultiSelectTagDropdownProps> = ({
  selectedTags,
  allAvailableTags,
  onTagsChange,
  onAddGlobalTag,
}) => {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    onTagsChange(newSelectedTags)
  }

  const handleAddTag = () => {
    if (
      inputValue.trim() !== '' &&
      !allAvailableTags.includes(inputValue.trim().toLocaleLowerCase())
    ) {
      onAddGlobalTag(inputValue.trim().toLocaleLowerCase())
      setInputValue('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tags
          {selectedTags.length > 0 && (
            <>
              <div className="ml-2 hidden h-4 items-center rounded-sm border-l pl-2 text-foreground lg:flex">
                {selectedTags.length > 2 ? (
                  <Badge variant="secondary" className="mr-2 px-1 font-normal">
                    {selectedTags.length} selected
                  </Badge>
                ) : (
                  selectedTags.map((tag) => (
                    <Badge variant="secondary" key={tag} className="mr-2 px-1 font-normal">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search tags or add new..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {allAvailableTags.map((tag) => (
                <CommandItem key={tag} onSelect={() => handleSelect(tag)}>
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className={cn('h-4 w-4')} />
                  </div>
                  <span>{tag}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {inputValue.trim() !== '' &&
              !allAvailableTags.includes(inputValue.trim().toLocaleLowerCase()) && (
                <CommandItem onSelect={handleAddTag}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add "{inputValue.trim()}"
                </CommandItem>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default MultiSelectTagDropdown
