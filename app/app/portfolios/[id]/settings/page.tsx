'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Trash2, AlertTriangle, Save, Loader2, Info, Lock } from 'lucide-react'
import { deletePortfolio, getMetadata, updatePortfolio } from '@/services/portfolioService'
import { toast } from 'sonner'
import SectionContainer from '@/components/organismes/layout/SectionContainer'

export default function PortfolioSettings() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [portfolioName, setPortfolioName] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await getMetadata(id as string)
        setPortfolioName(res.name || '')
        setIsPublic(res.isPublic || false)
      } catch (err) {
        toast.error('Erreur lors du chargement des paramètres')
      } finally {
        setLoading(false)
      }
    }
    fetchMetadata()
  }, [id])

  const handleDelete = async () => {
    const confirm = window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce portefeuille ? Cette action est irréversible.')
    if (!confirm) return

    setDeleting(true)
    try {
      await deletePortfolio(id as string)
      toast.success('Portefeuille supprimé avec succès')
      router.push('/app/portfolios')
    } catch (err) {
      toast.error('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePortfolio(id as string, {
        name: portfolioName,
        visibility: isPublic
      })
      toast.success('Modifications enregistrées avec succès !')
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement des modifications.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SectionContainer className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </SectionContainer>
    )
  }

  return (
    <SectionContainer className="mx-auto max-w-3xl space-y-8 py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres du Portefeuille</h2>
        <p className="text-muted-foreground">Gérez les préférences et la visibilité de votre portefeuille.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Général</CardTitle>
          <CardDescription>Mettez à jour les informations de base de votre portefeuille.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du portefeuille</Label>
            <Input 
              id="name" 
              value={portfolioName} 
              onChange={(e) => setPortfolioName(e.target.value)} 
            />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Portefeuille Public</Label>
              <p className="text-sm text-muted-foreground">
                Permet aux autres utilisateurs de voir et de suivre votre portefeuille.
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {isPublic && (
            <div className="flex flex-col gap-2 rounded-md bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-400">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="h-4 w-4" /> Partagez votre stratégie avec la communauté ! 🌍
              </div>
              <p>
                Rendre votre portefeuille public permet aux autres investisseurs de s'inspirer de vos allocations et de découvrir de nouvelles actions.
              </p>
              <div className="mt-1 flex items-start gap-2 font-medium">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Confidentialité garantie</strong> : Vos montants exacts (capital, liquidités, gains en devises) sont totalement masqués. Seuls les pourcentages de performance et le poids de chaque action sont visibles.
                </span>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-full">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} /> Zone de Danger
          </CardTitle>
          <CardDescription>Actions irréversibles concernant ce portefeuille.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-foreground">Supprimer le portefeuille</h4>
              <p className="max-w-md text-sm text-muted-foreground">
                Cette action supprimera définitivement toutes les transactions et l'historique de performance.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2 shrink-0">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />} 
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </SectionContainer>
  )
}
