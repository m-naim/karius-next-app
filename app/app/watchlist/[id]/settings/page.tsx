'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

import watchListService, { removeList } from '@/services/watchListService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function WatchlistSettings() {
  const router = useRouter()
  const id = usePathname().split('/')[3]
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    isPublic: false,
    benchmark: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await watchListService.get(id)
        const watchlist = response.watchlist
        setFormData({
          name: watchlist.name || '',
          isPublic: watchlist.is_public || false,
          benchmark: watchlist.benchmark || '',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les informations de la watchlist.',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await watchListService.updateList(id, {
        name: formData.name,
        isPublic: formData.isPublic,
        benchmark: formData.benchmark || null,
      })
      toast({
        title: 'Succès',
        description: 'La watchlist a été mise à jour.',
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = async () => {
    try {
      await removeList(id)
      router.push('/app/watchlist')
    } catch (e) {
      console.error('error', e)
    }
  }
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SectionContainer className="max-w-3xl space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Link href={`/app/watchlist/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres de la watchlist</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les préférences et la visibilité de votre liste de suivi.
          </p>
        </div>
      </div>

      <Separator />

      <Card className="bg-dark">
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
          <CardDescription>
            Ces informations sont visibles si la watchlist est publique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la watchlist</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Mon Portefeuille PEA"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benchmark">Benchmark (Optionnel)</Label>
              <Input
                id="benchmark"
                value={formData.benchmark}
                onChange={(e) => setFormData({ ...formData, benchmark: e.target.value })}
                placeholder="Ex: ^GSPC, ^FCHI"
              />
              <p className="text-[11px] text-muted-foreground">
                Symbole Yahoo Finance pour la comparaison des performances.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="cursor-pointer text-base">
                  Visibilité publique
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux autres utilisateurs de voir cette watchlist.
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>

            <div className="flex justify-end gap-5 pt-4">
              <Button variant="destructive" onClick={handleDeleteClick} className="min-w-[150px]">
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                <span>Supprimer</span>
              </Button>

              <Button type="submit" disabled={saving} className="min-w-[150px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </SectionContainer>
  )
}
