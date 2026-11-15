'use client'

import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { numberError, parseNumber, type NumberRule } from '@/lib/mortgage-math'

export function useNumberForm<T extends Record<string, number>>(
  initial: T,
  rules: Record<keyof T, NumberRule>
) {
  const toDraft = (values: T) =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, String(value)])
    ) as Record<keyof T, string>
  const [draft, setDraft] = useState(() => toDraft(initial))
  const values = Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [key, parseNumber(String(value))])
  ) as T
  const errors: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const error = numberError(values[key], rules[key])
    if (error) errors[key] = error
  }
  return {
    draft,
    values,
    errors,
    valid: Object.keys(errors).length === 0,
    setField: (key: keyof T, value: string | number) =>
      setDraft((current) => ({ ...current, [key]: String(value) })),
    setValues: (values: T) => setDraft(toDraft(values)),
  }
}

export default function NumberField({
  label,
  value,
  onChange,
  error,
  integer,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  integer?: boolean
  hint?: string
}) {
  const id = useId()
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode={integer ? 'numeric' : 'decimal'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-help` : undefined}
        className={`h-11 text-base lg:h-9 lg:text-sm ${error ? 'border-destructive' : ''}`}
      />
      {(error || hint) && (
        <p
          id={`${id}-help`}
          className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
