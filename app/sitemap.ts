import { MetadataRoute } from 'next'
import { getAllBlogs, getAllGuides, getAllAnalyses } from '@/lib/tina'
import siteMetadata from '@/data/siteMetadata'
import { routesData } from '@/data/Routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl

  const rawBlogs = await getAllBlogs()
  const rawGuides = await getAllGuides()
  const rawAnalyses = await getAllAnalyses()

  const blogRoutes = rawBlogs
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const guideRoutes = rawGuides
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const analyseRoutes = rawAnalyses
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: `${siteUrl}/fr/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = routesData.map((route) => ({
    url: `${siteUrl}/${route.href}`,
    lastModified: route.lastMod,
  }))

  return [...routes, ...blogRoutes, ...analyseRoutes, ...guideRoutes]
}
