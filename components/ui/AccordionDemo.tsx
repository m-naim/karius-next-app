import { Accordion, AccordionItem } from '@/components/ui/accordion'
import FAQ from '@/data/HomeFAQ'

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ.map((item) => (
        <AccordionItem
          key={'i-' + item.index}
          className=""
          title={item.question}
          content={item.response}
        ></AccordionItem>
      ))}
    </Accordion>
  )
}
