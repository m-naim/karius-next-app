'use client'

import { useMDXComponent } from 'next-contentlayer2/hooks'
import { components } from './MDXComponents'

interface MDXLayoutRendererProps {
  code: string
  components?: any
  [key: string]: any
}

export const MDXLayoutRenderer = ({ code, components: MDXComponents, ...rest }: MDXLayoutRendererProps) => {
  const MDXComponent = useMDXComponent(code)

  return <MDXComponent components={{ ...components, ...MDXComponents }} {...rest} />
}
