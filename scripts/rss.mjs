import { writeFileSync, mkdirSync, readdirSync, readFileSync, existsSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import matter from 'gray-matter'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' with { type: 'json' }

function getBlogsFromFiles() {
  const dirPath = path.resolve(process.cwd(), 'data/blog')
  if (!existsSync(dirPath)) return []
  
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
  return files.map((file) => {
    const raw = readFileSync(path.join(dirPath, file), 'utf-8')
    const { data } = matter(raw)
    const fileName = file.replace(/\.(mdx|md)$/, '')
    return {
      slug: data.slug || fileName,
      title: data.title || fileName,
      summary: data.summary || '',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      draft: Boolean(data.draft),
      tags: data.tags || [],
    }
  })
}

const escape = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const sortPosts = (allPosts) => {
  return allPosts.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}

const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${config.email} (${config.author})</author>
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
  </item>
`

const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./public/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allBlogs.filter((post) => post.tags.map((t) => slug(t)).includes(tag))
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join('public', 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  const blogs = getBlogsFromFiles()
  generateRSS(siteMetadata, blogs)
  console.log('RSS feed generated...')
}
export default rss
