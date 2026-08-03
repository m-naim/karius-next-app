import { getAllAuthors } from '@/lib/tina'
import { MDXLayoutRenderer } from '@/components/molecules/article/MDXLayoutRenderer'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from '@/lib/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default async function Page() {
  const authors = await getAllAuthors()
  const author = authors.find((p: any) => p.slug === 'default') || authors[0]
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={(author?.body as any)?.raw || (author?.body as any)?.code || ''} />
      </AuthorLayout>
    </>
  )
}
