import { MetadataRoute } from 'next'
import { allBlogs, allGuides, allAnalyses } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { routesData } from '@/data/Routes'

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

  const routes = routesData.map((route) => ({
    url: `${siteUrl}/${route.href}`,
    lastModified: route.lastMod,
  }))

  return [...routes, ...blogRoutes, ...analyseRoutes, ...guideRoutes]
}
