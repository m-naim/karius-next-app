import client from '../tina/__generated__/client'
import readingTime from 'reading-time'
import { extractTocHeadings } from './contentlayer'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DATA_DIR = path.join(process.cwd(), 'data')

function getLocalFiles(subDir: string) {
  let targetDir = path.join(DATA_DIR, subDir)

  if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
    const parentContentDir = path.resolve(process.cwd(), '../boursehorus-content', subDir)
    const localContentDir = path.resolve(process.cwd(), 'boursehorus-content', subDir)
    if (fs.existsSync(parentContentDir) && fs.readdirSync(parentContentDir).length > 0) {
      targetDir = parentContentDir
    } else if (fs.existsSync(localContentDir) && fs.readdirSync(localContentDir).length > 0) {
      targetDir = localContentDir
    } else if (!fs.existsSync(targetDir)) {
      return []
    }
  }

  const files: string[] = []
  function readDirRecursive(dir: string) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        readDirRecursive(fullPath)
      } else if (entry.isSymbolicLink()) {
        try {
          const realPath = fs.realpathSync(fullPath)
          const stat = fs.statSync(realPath)
          if (stat.isDirectory()) {
            readDirRecursive(realPath)
          } else if (stat.isFile() && (realPath.endsWith('.mdx') || realPath.endsWith('.md'))) {
            files.push(fullPath)
          }
        } catch (e) {
          // ignore broken symlink
        }
      } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
        files.push(fullPath)
      }
    }
  }

  readDirRecursive(targetDir)

  return files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(fileContent)
    const relativePath = path.relative(targetDir, filePath).replace(/\\/g, '/')
    const slug = relativePath.replace(/\.(mdx|md)$/, '')

    return {
      ...frontmatter,
      slug,
      path: `${subDir}/${slug}`,
      filePath: `${subDir}/${relativePath}`,
      readingTime: readingTime(content),
      toc: extractTocHeadings(content),
      body: {
        raw: content,
        code: content,
      },
    }
  })
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
    // Fallback to local files if GraphQL server is not reachable during static build
  }

  return getLocalFiles('blog')
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
    // Fallback to local files if GraphQL server is not reachable during static build
  }

  return getLocalFiles('guide')
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
    // Fallback to local files if GraphQL server is not reachable during static build
  }

  return getLocalFiles('analyse')
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
    // Fallback to local files if GraphQL server is not reachable during static build
  }

  return getLocalFiles('authors')
}
