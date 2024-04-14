'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import authService from '../../services/authService'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function Signup() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  const onChangevalue = (e, setState) => {
    const value = e.target.value
    setState(value)
  }

  const logIn = async () => {
    if (username == null || username.length <= 0)
      return setMessage("Le nom d'utilisateur est obligatoire")
    if (email == null || email.length <= 0) return setMessage("L'email est obligatoire")
    if (password == null || password.length <= 0)
      return setMessage('Le mot de passe est obligatoire')
    try {
      const response = await authService.register(username, email, password)
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
    <section className=" flex  w-full place-content-center items-center justify-center py-7">
      <form className="m-4 w-full max-w-xl space-y-6 p-4 sm:p-6  lg:p-12" action="#">
        <h2>Crée un compte </h2>
        <span>Pour continuer votre aventure 🚀</span>
        <div className="w-full">
          <Label
            htmlFor="email"
            className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Votre surnom
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            className="input-primary"
            placeholder="Batman"
            value={username}
            onChange={(e) => onChangevalue(e, setUsername)}
          />
        </div>
        <div className="w-full">
          <Label
            htmlFor="email"
            className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Votre email
          </Label>
          <Input
            type="email"
            name="email"
            id="email"
            className="input-primary"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => onChangevalue(e, setEmail)}
          />
        </div>
        <div>
          <Label
            htmlFor="password"
            className="mb-2 block text-left text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Votre mot de passe
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

        <Button type="submit" className="btn-primary" onClick={logIn}>
          Crée votre compte
        </Button>

        {message.length > 0 && (
          <div
            className="relative flex content-center justify-between rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            <span className="block p-1 sm:inline">{message}</span>
            <Button variant="ghost" size="sm" className=" px-4 py-3" onClick={() => setMessage('')}>
              <X size="16" />
            </Button>
          </div>
        )}

        <div className="p-2 text-sm font-medium text-gray-500 dark:text-gray-300">
          Vos avez déjà un compte?{' '}
          <Link className="text-primary hover:underline" href="/login">
            Se connecter
          </Link>
        </div>
      </form>
    </section>
  )
}

export default Signup
