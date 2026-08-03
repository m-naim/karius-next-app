import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'
import ListLayout from '@/layouts/ListLayout'
import { getAllAnalyses } from '@/lib/tina'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: "Analyse fondamental d'actions boursières",
})

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
  return paths
}

export default async function TagPage({ params, searchParams }: { params: Promise<any>; searchParams: Promise<{ tag?: string }> }) {
  const resolvedSearchParams = await searchParams
  const tag = resolvedSearchParams?.tag
  const rawAnalyses = await getAllAnalyses()

  const filteredPosts = allCoreContent(
    sortPosts(
      rawAnalyses.filter(
        (post: any) => !(tag && post.tags && !post.tags.map((t: string) => slug(t)).includes(tag))
      )
    )
  )

  return <ListLayout posts={filteredPosts} title={'Analyse fondamental des Actions boursières'} />
}
