import TOCInline from './TOCInline'
import Pre from './Pre'
import type { MDXComponents } from 'mdx/types'
import CustomLink from '../../atoms/Link'
import { MdxImage as Image } from '@/components/atoms/MdxImage'
import TableWrapper from './TableWrapper'
import { NewsletterForm } from '../ui/NewsletterForm'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  thead: (props: any) => (
    <thead className="bg-muted/70 text-foreground border-b border-border font-bold uppercase text-[11px] tracking-wider" {...props} />
  ),
  tbody: (props: any) => <tbody className="divide-y divide-border/40 bg-card/30" {...props} />,
  tr: (props: any) => <tr className="hover:bg-muted/30 transition-colors" {...props} />,
  th: (props: any) => (
    <th className="px-4 py-3 font-semibold text-foreground text-left" {...props} />
  ),
  td: (props: any) => (
    <td className="px-4 py-3 text-foreground/90 text-left align-middle" {...props} />
  ),
  BlogNewsletterForm: NewsletterForm,
}
