'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Loader2, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { follow } from '@/services/portfolioService'
import { cn } from '@/lib/utils'

interface FavoritePortfolioButtonProps {
  id: string
  initialFavorite?: boolean
  onChanged?: (favorite: boolean) => void
  compact?: boolean
}

export function FavoritePortfolioButton({
  id,
  initialFavorite = false,
  onChanged,
  compact = false,
}: FavoritePortfolioButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite)
  const [pending, setPending] = useState(false)
  const { toast } = useToast()

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (pending) return

    setPending(true)
    try {
      const result = await follow(id)
      const nextFavorite = Boolean(result?.followed)
      setFavorite(nextFavorite)
      onChanged?.(nextFavorite)
      toast({
        title: nextFavorite ? 'Portefeuille ajouté aux favoris' : 'Portefeuille retiré des favoris',
        description: nextFavorite
          ? 'Vous recevrez les alertes de mouvement si vos notifications sont activées.'
          : 'Les alertes de ce portefeuille sont désactivées.',
      })
    } catch (error) {
      console.error('Unable to update portfolio favorite:', error)
      toast({
        variant: 'destructive',
        title: 'Favori non modifié',
        description: 'Impossible de mettre à jour ce favori. Réessayez dans un instant.',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={favorite}
      title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        compact ? 'h-8 w-8' : 'h-9 w-9',
        favorite
          ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25'
          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary',
      )}
    >
      {pending ? (
        <Loader2 className={cn('animate-spin', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      ) : (
        <Star className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', favorite && 'fill-current')} />
      )}
    </button>
  )
}
