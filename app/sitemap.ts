import { MetadataRoute } from 'next'
import { getAllBlogs, getAllGuides, getAllAnalyses } from '@/lib/tina'
import siteMetadata from '@/data/siteMetadata'
import { routesData } from '@/data/Routes'
import { absoluteSiteUrl } from '@/lib/site-urls'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteMetadata.siteUrl

  const [rawBlogs, rawGuides, rawAnalyses] = await Promise.all([
    getAllBlogs(),
    getAllGuides(),
    getAllAnalyses(),
  ])

  const blogRoutes = rawBlogs
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: absoluteSiteUrl(siteUrl, `fr/${post.path}`),
      lastModified: post.lastmod || post.date,
    }))

  const guideRoutes = rawGuides
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: absoluteSiteUrl(siteUrl, `fr/${post.path}`),
      lastModified: post.lastmod || post.date,
    }))

  const analyseRoutes = rawAnalyses
    .filter((post: any) => !post.draft)
    .map((post: any) => ({
      url: absoluteSiteUrl(siteUrl, `fr/${post.path}`),
      lastModified: post.lastmod || post.date,
    }))

  const routes = routesData.map((route) => ({
    url: absoluteSiteUrl(siteUrl, route.href),
    lastModified: route.lastMod,
  }))

  const calculators = ['calculateur-immobilier', 'calculateur-mensualite'].map((slug) => ({
    url: absoluteSiteUrl(siteUrl, `fr/outils/${slug}`),
  }))
  const allRoutes = [...routes, ...calculators, ...blogRoutes, ...analyseRoutes, ...guideRoutes]
  return [...new Map(allRoutes.map((route) => [route.url, route])).values()]
}
