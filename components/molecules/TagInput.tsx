'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { XIcon } from 'lucide-react'

interface TagInputProps {
  initialTags?: string[]
  onTagsChange: (tags: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({ initialTags = [], onTagsChange }) => {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault()
      const newTag = inputValue.trim().toLocaleLowerCase()
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag]
        setTags(updatedTags)
        onTagsChange(updatedTags)
      }
      setInputValue('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    onTagsChange(updatedTags)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} className="flex items-center gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Add tags (press Enter)"
        className="w-full"
      />
    </div>
  )
}

export default TagInput
