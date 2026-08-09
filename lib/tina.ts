import client from '../tina/__generated__/client'
import readingTime from 'reading-time'
import { extractTocHeadings } from './contentlayer'
import matter from 'gray-matter'

async function getGitHubFiles(subDir: string) {
  try {
    const owner = 'm-naim'
    const repo = 'boursehorus-content'
    const branch = process.env.NEXT_PUBLIC_TINA_BRANCH || 'main'
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${subDir}?ref=${branch}`

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'boursehorus-app',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(url, { headers, next: { revalidate: 60 } })
    if (!res.ok) return []

    const items = await res.json()
    if (!Array.isArray(items)) return []

    const files = items.filter(
      (item: any) => item.type === 'file' && (item.name.endsWith('.mdx') || item.name.endsWith('.md'))
    )

    const results = await Promise.all(
      files.map(async (file: any) => {
        const fileRes = await fetch(file.download_url, { next: { revalidate: 60 } })
        const fileContent = await fileRes.text()
        const { data: frontmatter, content } = matter(fileContent)
        const slug = file.name.replace(/\.(mdx|md)$/, '')

        return {
          ...frontmatter,
          slug,
          path: `${subDir}/${slug}`,
          filePath: `${subDir}/${file.name}`,
          readingTime: readingTime(content),
          toc: extractTocHeadings(content),
          body: {
            raw: content,
            code: content,
          },
        }
      })
    )

    return results
  } catch (error) {
    return []
  }
}

export async function getAllBlogs() {
  try {
    const res = await client.queries.blogConnection()
    const edges = res.data.blogConnection.edges || []
    
    if (edges.length > 0) {
      return edges.map((edge) => {
        const node = edge?.node
        if (!node) return null

        const filename = node._sys.filename
        const rawContent = JSON.stringify(node.body || {})
        
        return {
          ...node,
          slug: filename,
          path: `blog/${filename}`,
          filePath: `blog/${filename}.mdx`,
          readingTime: readingTime(rawContent),
          toc: extractTocHeadings(rawContent),
          body: {
            raw: rawContent,
            code: rawContent,
          },
        }
      }).filter(Boolean)
    }
  } catch (error) {
    // Fallback to GitHub REST API
  }

  return getGitHubFiles('blog')
}

export async function getAllGuides() {
  try {
    const res = await client.queries.guideConnection()
    const edges = res.data.guideConnection.edges || []

    if (edges.length > 0) {
      return edges.map((edge) => {
        const node = edge?.node
        if (!node) return null

        const filename = node._sys.filename
        const rawContent = JSON.stringify(node.body || {})

        return {
          ...node,
          slug: filename,
          path: `guide/${filename}`,
          filePath: `guide/${filename}.mdx`,
          readingTime: readingTime(rawContent),
          toc: extractTocHeadings(rawContent),
          body: {
            raw: rawContent,
            code: rawContent,
          },
        }
      }).filter(Boolean)
    }
  } catch (error) {
    // Fallback to GitHub REST API
  }

  return getGitHubFiles('guide')
}

export async function getAllAnalyses() {
  try {
    const res = await client.queries.analyseConnection()
    const edges = res.data.analyseConnection.edges || []

    if (edges.length > 0) {
      return edges.map((edge) => {
        const node = edge?.node
        if (!node) return null

        const filename = node._sys.filename
        const rawContent = JSON.stringify(node.body || {})

        return {
          ...node,
          slug: filename,
          path: `analyse/${filename}`,
          filePath: `analyse/${filename}.mdx`,
          readingTime: readingTime(rawContent),
          toc: extractTocHeadings(rawContent),
          body: {
            raw: rawContent,
            code: rawContent,
          },
        }
      }).filter(Boolean)
    }
  } catch (error) {
    // Fallback to GitHub REST API
  }

  return getGitHubFiles('analyse')
}

export async function getAllAuthors() {
  try {
    const res = await client.queries.authorsConnection()
    const edges = res.data.authorsConnection.edges || []

    if (edges.length > 0) {
      return edges.map((edge) => {
        const node = edge?.node
        if (!node) return null

        const filename = node._sys.filename

        return {
          ...node,
          slug: filename,
          path: `authors/${filename}`,
          filePath: `authors/${filename}.mdx`,
          body: {
            raw: JSON.stringify(node.body || {}),
          },
        }
      }).filter(Boolean)
    }
  } catch (error) {
    // Fallback to GitHub REST API
  }

  return getGitHubFiles('authors')
}
