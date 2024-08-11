import ListLayout from '@/layouts/ListLayout'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import { slug } from 'github-slugger'

const POSTS_PER_PAGE = 10

export const metadata = genPageMetadata({ title: 'Blog' })

export default function BlogPage({ searchParams }) {
  const tag = searchParams.tag
  const posts = allCoreContent(
    sortPosts(
      allBlogs.filter((post) => !(tag && post.tags && !post.tags.map((t) => slug(t)).includes(tag)))
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
