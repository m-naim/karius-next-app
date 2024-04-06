import { useEffect, useState } from 'react'
import authService from '@/services/authService'

export interface AuthData {
  sub: string
  iat: number
  exp: number
}

const useAuth = (): [AuthData | null, Boolean] => {
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [isAuthentificated, setIsAuthentificated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (token != null) {
      const decodedJwt = JSON.parse(atob(token.split('.')[1]))
      console.log(decodedJwt)
      console.log(decodedJwt.exp * 1000 < Date.now())
      if (decodedJwt.exp * 1000 < Date.now()) {
        authService.logOut()
        setAuthData(null)
        setIsAuthentificated(false)
        return
      }
      setAuthData(decodedJwt)
      setIsAuthentificated(true)
    }
  }, [])

  return [authData, isAuthentificated]
}

export default useAuth
