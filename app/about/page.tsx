import { getAllAuthors } from '@/lib/tina'
import { MDXLayoutRenderer } from '@/components/molecules/article/MDXLayoutRenderer'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from '@/lib/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'À propos' })

const fallbackAuthor: any = {
  name: 'Bourse Horus',
  avatar: '/static/favicons/android-icon-192x192.png',
  occupation: 'Plateforme & Analyse Financière',
  company: 'Bourse Horus',
  slug: 'default',
  body: { code: '' },
}

export default async function Page() {
  let author: any = fallbackAuthor
  try {
    const authors = await getAllAuthors()
    if (Array.isArray(authors) && authors.length > 0) {
      author = authors.find((p: any) => p.slug === 'default') || authors[0] || fallbackAuthor
    }
  } catch (e) {
    console.error('Failed to load author for about page:', e)
  }

  const mainContent = coreContent(author) || fallbackAuthor

  return (
    <AuthorLayout content={mainContent}>
      <MDXLayoutRenderer code={(author?.body as any)?.raw || (author?.body as any)?.code || ''} />
    </AuthorLayout>
  )
}
