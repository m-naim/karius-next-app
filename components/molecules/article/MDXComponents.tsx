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
  BlogNewsletterForm: NewsletterForm,
}
