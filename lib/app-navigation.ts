export function getLoginDestination(redirect: string | null): string {
  if (!redirect || !redirect.startsWith('/')) return '/app'
  const origin = 'https://boursehorus.local'
  try {
    const url = new URL(redirect, origin)
    if (
      url.origin === origin &&
      (url.pathname === '/app' || url.pathname.startsWith('/app/'))
    ) {
      return `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    // Invalid or external destinations fall back to the app home.
  }
  return '/app'
}
