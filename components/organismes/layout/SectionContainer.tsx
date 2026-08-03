import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string | undefined
}

export default function SectionContainer({ children, className }: Props) {
  return (
    <section
      className={cn('mx-auto w-full max-w-full min-w-0 px-2 sm:px-6 md:px-4 xl:max-w-7xl', className)}
    >
      {children}
    </section>
  )
}
