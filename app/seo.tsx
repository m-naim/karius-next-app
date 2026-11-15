import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps extends Omit<Metadata, 'title' | 'description'> {
  title: string
  description?: string
  image?: string
  canonicalUrl?: string
}

export function genPageMetadata({
  title,
  description,
  image,
  canonicalUrl,
  alternates,
  openGraph,
  twitter,
  ...rest
}: PageSEOProps): Metadata {
  const pageTitle = title.replace(/(?:\s*\|\s*BourseHorus)+\s*$/i, '').trim()
  const fullTitle = pageTitle.toLowerCase().includes(siteMetadata.title.toLowerCase())
    ? pageTitle
    : `${pageTitle} | ${siteMetadata.title}`
  const pageDescription = description || siteMetadata.description
  const canonical = canonicalUrl ? new URL(canonicalUrl, siteMetadata.siteUrl).href : undefined

  return {
    ...rest,
    // An absolute title prevents the root layout from appending the brand twice.
    title: { absolute: fullTitle },
    description: pageDescription,
    ...(canonical || alternates
      ? { alternates: { ...alternates, ...(canonical ? { canonical } : {}) } }
      : {}),
    openGraph: {
      title: fullTitle,
      description: pageDescription,
      url: canonical || './',
      siteName: siteMetadata.title,
      images: image ? [image] : [siteMetadata.socialBanner],
      locale: 'fr_FR',
      type: 'website',
      ...openGraph,
    },
    twitter: {
      title: fullTitle,
      description: pageDescription,
      card: 'summary_large_image',
      images: image ? [image] : [siteMetadata.socialBanner],
      ...twitter,
    },
  }
}
