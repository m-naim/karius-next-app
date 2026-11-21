'use client'

import { AuthContext } from 'hooks/authContext'
import { useUser } from 'hooks/useUser'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Providers({ children }) {
  const session = useUser()
  return (
    <AuthContext.Provider value={session}>
      <TooltipProvider>{children}</TooltipProvider>
    </AuthContext.Provider>
  )
}
