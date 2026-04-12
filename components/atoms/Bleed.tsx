import { ReactNode } from 'react'

interface BleedProps {
  children: ReactNode
}

const Bleed = ({ children }: BleedProps) => (
  <div className="full-bleed relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
    {children}
  </div>
)

export default Bleed
