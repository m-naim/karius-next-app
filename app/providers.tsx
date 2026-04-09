'use client'

import { AuthContext } from 'hooks/authContext'
import { useUser } from 'hooks/useUser'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }) {
  const { user, addUser, removeUser } = useUser()
  return (
    <AuthContext.Provider value={{ user, addUser, removeUser }}>
      <TooltipProvider>{children}</TooltipProvider>
    </AuthContext.Provider>
  )
}
