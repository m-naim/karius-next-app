import { slug } from 'github-slugger'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayout'
import { allAnalyses } from 'contentlayer/generated'
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

export default function TagPage({ params, searchParams }) {
  const tag = searchParams.tag
  // const title = tag.toUpperCase()

  const filteredPosts = allCoreContent(
    sortPosts(
      allAnalyses.filter(
        (post) => !(tag && post.tags && !post.tags.map((t) => slug(t)).includes(tag))
      )
    )
  )

  return <ListLayout posts={filteredPosts} title={'Analyse fondamental des Actions boursières'} />
}
