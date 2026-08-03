import { components as defaultComponents } from './MDXComponents'
import { MDXRemote } from 'next-mdx-remote/rsc'

interface MDXLayoutRendererProps {
  code: string
  components?: any
  [key: string]: any
}

export const MDXLayoutRenderer = ({ code, components: MDXComponents, ...rest }: MDXLayoutRendererProps) => {
  const mergedComponents = { ...defaultComponents, ...MDXComponents }

  if (!code || typeof code === 'object') {
    return null
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote source={code} components={mergedComponents as any} {...rest} />
    </div>
  )
}
