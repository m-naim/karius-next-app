'use client'
import React, { useState } from 'react'
import authService from '../../services/authService'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

function Login() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const onChangevalue = (e, setState) => {
    const value = e.target.value
    setState(value)
  }

  const logIn = async (e) => {
    e.preventDefault()
    if (email == null || email.length <= 0) return setMessage("L'email est obligatoire")
    if (password == null || password.length <= 0)
      return setMessage('Le mot de passe est obligatoire')
    try {
      const response = await authService.login(email, password)
      login(response.accessToken)
      router.push('/app/portfolios')
    } catch (error) {
      console.error(error)
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString()
      setMessage(resMessage)
    }
  }
  return (
    <section className="flex  w-full place-content-center items-center justify-center py-7">
      <div className="m-4 w-full max-w-xl p-4 sm:p-6  lg:p-12 ">
        <form className="space-y-6" action="#">
          <h2>Se connecter à Boursehorus</h2>
          <span>Bon retour Parmis nous 😊</span>

          <div className="w-full">
            <Label className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300">
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
            <Label className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300">
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
              className="ml-auto text-sm text-primary hover:underline"
              data-umami-event="login-forgot-button"
            >
              Mot de passe oublié?
            </Button>
          </div>
          <Button type="submit" className="btn-primary" onClick={logIn}>
            Se connecter
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
