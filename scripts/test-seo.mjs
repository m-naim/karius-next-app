import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('..', import.meta.url))
const bundled = await build({
  absWorkingDir: root,
  stdin: {
    contents:
      "export { genPageMetadata } from './app/seo'; export { absoluteSiteUrl } from './lib/site-urls'; export { default as sitemap } from './app/sitemap';",
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  plugins: [
    {
      name: 'cms-fixtures',
      setup(builder) {
        builder.onResolve({ filter: /lib\/tina$/ }, () => ({ path: 'cms', namespace: 'fixture' }))
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
          contents: `
        export async function getAllBlogs() { return [
          {path: 'blog/exemple', date: '2026-01-01'},
          {path: 'blog/brouillon', draft: true},
        ] }
        export async function getAllGuides() { return [{path: '/guide/exemple', date: '2026-02-01'}] }
        export async function getAllAnalyses() { return [{path: 'blog/exemple', date: '2026-01-01'}] }
      `,
        }))
      },
    },
  ],
})
const { genPageMetadata, absoluteSiteUrl, sitemap } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
)

test('Un seul nom de marque, sans seconde application du template du layout', () => {
  for (const title of [
    'Crédit immobilier',
    'Crédit immobilier | BourseHorus',
    'Crédit immobilier | Boursehorus | BourseHorus',
    'Boursehorus | Suivi de portefeuille',
  ]) {
    const metadata = genPageMetadata({ title })
    assert.equal((metadata.title.absolute.match(/boursehorus/gi) || []).length, 1)
    assert.equal(metadata.openGraph.title, metadata.title.absolute)
    assert.equal(metadata.twitter.title, metadata.title.absolute)
  }
})
test('Description propre à la page dans les trois métadonnées ; repli disponible', () => {
  const metadata = genPageMetadata({ title: 'Crédit', description: 'Description du calculateur.' })
  assert.equal(metadata.description, 'Description du calculateur.')
  assert.equal(metadata.openGraph.description, metadata.description)
  assert.equal(metadata.twitter.description, metadata.description)
  assert.ok(genPageMetadata({ title: 'Crédit' }).description.length > 0)
})
test('canonicalUrl devient une canonical absolue et une URL Open Graph', () => {
  const metadata = genPageMetadata({
    title: 'Crédit',
    canonicalUrl: '/fr/outils/calculateur-mensualite',
  })
  assert.equal(
    metadata.alternates.canonical,
    'https://www.boursehorus.com/fr/outils/calculateur-mensualite'
  )
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical)
  assert.ok(!('canonicalUrl' in metadata))
})
test('Les options explicites de métadonnées restent prises en compte', () => {
  const metadata = genPageMetadata({
    title: 'Crédit',
    description: 'Description',
    robots: { index: false },
    alternates: { canonical: '/explicite', languages: { 'fr-FR': '/fr' } },
    openGraph: { images: ['/personnalisee.png'] },
    twitter: { card: 'summary' },
  })
  assert.equal(metadata.robots.index, false)
  assert.equal(metadata.alternates.canonical, '/explicite')
  assert.equal(metadata.alternates.languages['fr-FR'], '/fr')
  assert.deepEqual(metadata.openGraph.images, ['/personnalisee.png'])
  assert.equal(metadata.openGraph.description, 'Description')
  assert.equal(metadata.twitter.card, 'summary')
})
test('Les variantes de chemins internes produisent la même URL', () => {
  for (const path of ['fr/outils/test', '/fr/outils/test', '//fr//outils/test']) {
    assert.equal(
      absoluteSiteUrl('https://www.BourseHorus.com/', path),
      'https://www.boursehorus.com/fr/outils/test'
    )
  }
  assert.equal(absoluteSiteUrl('https://www.boursehorus.com', ''), 'https://www.boursehorus.com/')
})
test('Le sitemap contient les calculateurs, exclut les brouillons et supprime les doublons', async () => {
  const entries = await sitemap(),
    urls = entries.map((entry) => entry.url)
  for (const slug of ['calculateur-immobilier', 'calculateur-mensualite'])
    assert.ok(urls.includes(`https://www.boursehorus.com/fr/outils/${slug}`))
  assert.ok(urls.includes('https://www.boursehorus.com/fr/guide/exemple'))
  assert.ok(!urls.some((url) => url.includes('brouillon')))
  assert.equal(new Set(urls).size, urls.length)
  assert.ok(urls.every((url) => !new URL(url).pathname.includes('//')))
})
test('robots.txt conserve l’exploration publique et ne contient plus de règles Apache', async () => {
  const robots = await readFile(new URL('../app/robots.txt', import.meta.url), 'utf8')
  assert.equal((robots.match(/^User-agent:/gim) || []).length, 1)
  assert.match(robots, /^Allow: \/$/m)
  assert.match(robots, /^Disallow: \/_vercel$/m)
  assert.match(robots, /^Sitemap: https:\/\/www\.boursehorus\.com\/sitemap\.xml$/m)
  assert.doesNotMatch(robots, /Rewrite/)
})
