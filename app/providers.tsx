'use client'

import { AuthContext } from 'hooks/authContext'
import { useUser } from 'hooks/useUser'

export function Providers({ children }) {
  const { user, addUser, removeUser } = useUser()
  return (
    <AuthContext.Provider value={{ user, addUser, removeUser }}>{children}</AuthContext.Provider>
  )
}
