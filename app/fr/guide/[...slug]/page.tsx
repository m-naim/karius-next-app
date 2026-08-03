import 'katex/dist/katex.css'

import { MDXLayoutRenderer } from '@/components/molecules/article/MDXLayoutRenderer'
import { sortPosts, coreContent, allCoreContent } from '@/lib/contentlayer'
import { getAllGuides, getAllAuthors } from '@/lib/tina'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import { round10 } from '@/lib/decimalAjustement'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const { slug: rawSlug } = await params
  const slug = decodeURI(rawSlug.join('/'))
  const allGuides = await getAllGuides()
  const allAuthors = await getAllAuthors()

  const post: any = allGuides.find((p: any) => p.slug === slug)
  const authorList = (post as any)?.authors || ['default']
  const authorDetails = authorList.map((author: string) => {
    const authorResults = allAuthors.find((p: any) => p.slug === author)
    return coreContent(authorResults)
  }).filter(Boolean)
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = authorDetails.map((author: any) => author?.name).filter(Boolean)
  let imageList = [siteMetadata.socialBanner]
  if (post.images) {
    imageList = typeof post.images === 'string' ? [post.images] : post.images
  }
  const ogImages = imageList.map((img: string) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const allGuides = await getAllGuides()
  const paths = allGuides.map((p: any) => ({ slug: p.slug.split('/') }))

  return paths
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: rawSlug } = await params
  const slug = decodeURI(rawSlug.join('/'))
  const allGuides = await getAllGuides()
  const allAuthors = await getAllAuthors()
  
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allGuides))
  const postIndex = sortedCoreContents.findIndex((p: any) => p.slug === slug)
  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post: any = allGuides.find((p: any) => p.slug === slug)
  if (!post) return notFound()

  const authorList = post?.authors || ['default']
  const authorDetails = authorList.map((author: string) => {
    const authorResults = allAuthors.find((p: any) => p.slug === author)
    return coreContent(authorResults)
  }).filter(Boolean)
  const mainContent = coreContent(post)
  const jsonLd = post.structuredData || {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.date,
    description: post.summary,
  }
  jsonLd['author'] = authorDetails.map((author: any) => {
    return {
      '@type': 'Person',
      name: author?.name,
    }
  })

  const Layout = layouts[post.layout || defaultLayout] || PostLayout

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout
        content={mainContent}
        authorDetails={authorDetails}
        next={next}
        prev={prev}
        toc={post.toc}
        readingTime={round10(post.readingTime?.minutes || 5, 0)}
      >
        <MDXLayoutRenderer code={post.body.raw || post.body.code} toc={post.toc} />
      </Layout>
    </>
  )
}
