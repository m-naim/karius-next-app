import ListLayout from '@/layouts/ListLayout'
import { allCoreContent, sortPosts } from '@/lib/contentlayer'
import { getAllBlogs } from '@/lib/tina'
import { genPageMetadata } from 'app/seo'
import { slug } from 'github-slugger'

const POSTS_PER_PAGE = 10

export const metadata = genPageMetadata({ title: 'Blog' })

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const resolvedSearchParams = await searchParams
  const tag = resolvedSearchParams?.tag
  const rawBlogs = await getAllBlogs()

  const posts = allCoreContent(
    sortPosts(
      rawBlogs.filter((post: any) => !(tag && post.tags && !post.tags.map((t: string) => slug(t)).includes(tag)))
    )
  )
  const pageNumber = 1
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title=" "
    />
  )
}
