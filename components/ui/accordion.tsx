'use client'
import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from 'lib/utils'

const Accordion = ({ className, children, ...props }) => {
  return <div>{children}</div>
}

const AccordionItem = ({ className, title, content, ...props }) => {
  const [isActive, setIsActive] = React.useState(false)

  return (
    <div className={cn('border-b', className)} {...props}>
      <AccordionTrigger isActive={isActive} setIsActive={setIsActive}>
        {title}
      </AccordionTrigger>
      <AccordionContent isActive={isActive}> {content} </AccordionContent>
    </div>
  )
}

const AccordionTrigger = ({ isActive, setIsActive, className, children, ...props }) => (
  <button className="flex w-full" onClick={() => setIsActive(!isActive)}>
    <div
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      <h3>{children}</h3>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isActive ? 'rotate-180' : ''
        )}
      />
    </div>
  </button>
)

const AccordionContent = ({ isActive, className, children, ...props }) => (
  <div
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', isActive ? '' : 'hidden', className)}>
      <p>{children}</p>
    </div>
  </div>
)

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
