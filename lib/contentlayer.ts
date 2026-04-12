export function dateSortDesc(a: string, b: string) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export function sortPosts(allPosts: any[]) {
  return allPosts.sort((a, b) => dateSortDesc(a.date, b.date))
}

export function coreContent(post: any) {
  if (!post) return null
  const { body, _raw, _id, ...content } = post
  return content
}

export function allCoreContent(allPosts: any[]) {
  return allPosts.filter((p) => !p.draft).map((p) => coreContent(p))
}

export function extractTocHeadings(source: string) {
  const headingLines = source.split('\n').filter((line) => line.match(/^#{1,6}\s/))

  return headingLines.map((raw) => {
    const depth = raw.match(/^#+/)?.[0].length || 0
    const value = raw.replace(/^#+\s/, '').trim()
    const url = `#${value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')}`
    return { depth, value, url }
  })
}
