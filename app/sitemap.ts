import { MetadataRoute } from 'next'
import { allBlogs, allGuides, allAnalyses } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const guideRoutes = allGuides
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const analyseRoutes = allAnalyses
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'fr/blog', 'fr/analyse', 'fr/guide'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date(28,1,2024).toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes, ...analyseRoutes, ...guideRoutes]
}
