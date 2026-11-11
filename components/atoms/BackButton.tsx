'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BackButton({
  fallbackHref,
  label = 'Retour au niveau supérieur',
  className,
}: {
  fallbackHref: string
  label?: string
  className?: string
}) {
  const router = useRouter()

  const goBack = () => {
    router.push(fallbackHref)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={goBack}
      className={cn('shrink-0 rounded-full', className)}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}
