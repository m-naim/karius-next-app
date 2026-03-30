'use client'

import React, { useEffect, useState } from 'react'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import {
  User,
  Eye,
  EyeOff,
  Save,
  Bell,
  BellOff,
  Send,
  LogOut,
  Lock,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ProfilePage() {
  const { logout } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showChatId, setShowChatId] = useState(false)
  const { toast } = useToast()

  // Profile Form state
  const [name, setName] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile()
      setProfile(data)
      setName(data.name || '')
      setTelegramChatId(data.telegramChatId || '')
      setNotificationsEnabled(data.notificationsEnabled || false)
    } catch (error) {
      console.error('Failed to fetch profile', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateProfile({
        name,
        telegramChatId,
        notificationsEnabled,
      })
      toast({
        title: 'Profil mis à jour',
        description: 'Vos modifications ont été enregistrées.',
      })
    } catch (error) {
      console.error('Failed to update profile', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
      })
      return
    }
    setPasswordLoading(true)
    try {
      await authService.changePassword({ oldPassword, newPassword })
      toast({ title: 'Succès', description: 'Mot de passe modifié avec succès.' })
      setIsPasswordDialogOpen(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to change password', error)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      confirm('Êtes-vous SÛR de vouloir supprimer votre compte ? Cette action est irréversible.')
    ) {
      try {
        await authService.deleteAccount()
        toast({ title: 'Compte supprimé' })
        handleLogout()
      } catch (error) {
        console.error('Failed to delete account', error)
      }
    }
  }

  const handleLogout = () => {
    authService.logOut()
    logout()
  }

  if (loading) {
    return (
      <div className="container mx-auto flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-10 flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10 text-primary">
          <User className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{profile?.name || 'Mon Profil'}</h1>
          <p className="text-muted-foreground">{profile?.email}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations Générales</CardTitle>
            <CardDescription>Mettez à jour vos informations de base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom d'affichage</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email} disabled className="bg-muted/50" />
              <p className="text-right text-[11px] italic text-muted-foreground">
                L'email ne peut pas être modifié.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifications & Alertes
            </CardTitle>
            <CardDescription>Gérez vos préférences de réception d'alertes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="notifications" className="text-base">
                  Activer les notifications Telegram
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevez vos alertes de prix et de PE instantanément.
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Send className="h-4 w-4 text-blue-500" />
                Configuration Telegram
              </div>

              <div className="space-y-2">
                <Label htmlFor="chatId" className="text-xs uppercase text-muted-foreground">
                  Votre Chat ID
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="chatId"
                      type={showChatId ? 'text' : 'password'}
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Non configuré"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChatId(!showChatId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showChatId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Obtenu via <code className="rounded bg-muted px-1">@userinfobot</code>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="border-orange-100 bg-orange-50/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-orange-500" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Changer le mot de passe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Changer le mot de passe</DialogTitle>
                  <DialogDescription>
                    Saisissez votre ancien mot de passe et le nouveau.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="old-pass">Ancien mot de passe</Label>
                    <Input
                      id="old-pass"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-pass">Nouveau mot de passe</Label>
                    <Input
                      id="new-pass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-pass">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirm-pass"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleChangePassword} disabled={passwordLoading || !newPassword}>
                    {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Zone de Danger */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Zone de Danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              La suppression de votre compte entraînera la perte de toutes vos watchlists,
              portefeuilles et alertes configurées.
            </p>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer mon compte définitivement
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={fetchProfile} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              'Enregistrement...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>

        <div className="mt-16 flex justify-center border-t pt-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter de la session
          </Button>
        </div>
      </div>
    </div>
  )
}
