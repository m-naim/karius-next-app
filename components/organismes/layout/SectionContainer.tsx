import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string | undefined
}

export default function SectionContainer({ children, className }: Props) {
  return (
    <section
      className={cn('mx-auto max-w-5xl px-1 sm:px-6  md:px-4 xl:max-w-7xl xl:px-0', className)}
    >
      {children}
    </section>
  )
}
