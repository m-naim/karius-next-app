'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { add } from '@/services/portfolioService'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

function AddPortfolio() {
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const addClick = async () => {
    if (!name.trim()) {
      setError('Le nom du portefeuille est requis')
      return
    }
    
    setError('')
    setLoading(true)
    
    try {
      const res = await add({
        name: name.trim(),
        visibility,
      })
      router.push(`/app/portfolios/${res.data.id}`, { scroll: false })
    } catch (err) {
      setError('Une erreur est survenue lors de la création')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-12 py-12">
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-center gap-2">
          <Link href={`/app/portfolios`} className="h-fit">
            <Button variant="ghost" size="icon" aria-label="Retour">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold leading-7 lg:leading-9 text-balance">
            Créer un portefeuille
          </h1>
        </div>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom du portefeuille</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value)
                if (error) setError('')
              }}
              placeholder="Ex: CTO Long Terme"
              maxLength={50}
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : undefined}
            />
            {error && (
              <p id="name-error" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 rounded-md border border-border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Visibilité publique</p>
              <p className="text-sm text-muted-foreground text-balance">
                Permettre aux autres utilisateurs de voir la composition de ce portefeuille.
              </p>
            </div>
            <Switch 
              checked={visibility} 
              onCheckedChange={setVisibility}
              aria-label="Basculer la visibilité publique"
            />
          </div>
        </div>

        <Button 
          onClick={addClick} 
          disabled={loading || !name.trim()}
          className="w-full"
        >
          {loading ? 'Création en cours...' : 'Créer le portefeuille'}
        </Button>
      </div>
    </div>
  )
}

export default AddPortfolio
