/** Join internal sitemap paths without generating duplicate slash variants. */
export function absoluteSiteUrl(base: string, path: string) {
  const pathname = path.split('/').filter(Boolean).join('/')
  return new URL(`/${pathname}`, base).href
}
