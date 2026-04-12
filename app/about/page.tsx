import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from '@/components/molecules/article/MDXLayoutRenderer'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from '@/lib/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />
      </AuthorLayout>
    </>
  )
}
