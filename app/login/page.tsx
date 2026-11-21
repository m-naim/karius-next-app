'use client'
import React, { useEffect, useState } from 'react'
import authService from '../../services/authService'
import { HttpError } from '@/services/http'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { getLoginDestination } from '@/lib/app-navigation'

function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason')
    if (reason === 'expired') setMessage('Votre session a expiré. Connectez-vous pour continuer.')
    if (reason === 'rejected') setMessage('Votre session n’est plus acceptée. Veuillez vous reconnecter.')
    if (reason === 'required') setMessage('Connectez-vous pour accéder à cette page.')
  }, [])

  const onChangevalue = (e, setState) => {
    const value = e.target.value
    setState(value)
  }

  const logIn = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (email == null || email.length <= 0) return setMessage("L'email est obligatoire")
    if (password == null || password.length <= 0)
      return setMessage('Le mot de passe est obligatoire')
    setSubmitting(true)
    setMessage('')
    try {
      await authService.login(email, password)
      router.replace(getLoginDestination(new URLSearchParams(window.location.search).get('redirect')))
    } catch (error) {
      setMessage(error instanceof HttpError && (error.status === 401 || error.status === 403)
        ? 'Email ou mot de passe incorrect.'
        : error.message || 'Connexion impossible. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <section className="flex  w-full place-content-center items-center justify-center py-7">
      <div className="m-4 w-full max-w-xl p-4 sm:p-6  lg:p-12 ">
        <form className="space-y-6" onSubmit={logIn}>
          <h2>Se connecter à Boursehorus</h2>
          <span>Bon retour Parmis nous 😊</span>

          <div className="w-full">
            <Label htmlFor="email" className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              id="email"
              className="input-primary"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => onChangevalue(e, setEmail)}
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300">
              Mot de passe
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              className="input-primary"
              value={password}
              onChange={(e) => onChangevalue(e, setPassword)}
            />
          </div>
          <div className="flex items-start gap-8">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="remember"
                  type="checkbox"
                  value=""
                  className="focus:ring-3 h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
              </div>
              <Label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Rester connecter
              </Label>
            </div>
            <Button
              variant="link"
              type="button"
              className="ml-auto text-sm text-primary hover:underline"
              data-umami-event="login-forgot-button"
            >
              Mot de passe oublié?
            </Button>
          </div>
          <Button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Connexion en cours…' : 'Se connecter'}
          </Button>

          {message.length > 0 && (
            <div
              className="relative flex place-content-between rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
              role="alert"
            >
              <span className="block sm:inline">{message}</span>
              <X fill="ef4444" onClick={() => setMessage('')}></X>
            </div>
          )}

          <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-300">
            Vous n'avez pas un compte?{' '}
            <Link
              data-umami-event="login-create-account-button"
              className="text-primary hover:underline"
              href="/signup"
            >
              Crée un compte
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Login
