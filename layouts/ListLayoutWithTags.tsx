import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Analyse, Guide } from 'contentlayer/generated'
import Link from '@/components/Link'
import { groupBy } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'

type Content = Blog | Analyse | Guide

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Content>[]
  title: string
  initialDisplayPosts?: CoreContent<Content>[]
  pagination?: PaginationProps
}

export default function ListLayoutWithTags({ posts, initialDisplayPosts = [] }: ListLayoutProps) {
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  const groupByTag = groupBy(displayPosts, (post) => {
    return post.tags[0]
  })

  return (
    <div>
      <div className="pb-6 pt-6"></div>
      <div className="flex sm:space-x-24">
        <div>
          {Object.entries(groupByTag).map(([tag, posts]: [string, Guide[]]) => (
            <div key={tag}>
              <p className="text-xl font-semibold capitalize leading-8 tracking-tight text-primary">
                {tag}
              </p>
              <ul className="flex flex-wrap gap-4">
                {posts.map((post) => (
                  <li className="py-2" key={post._id}>
                    <Link href={`/fr/${post.path}`}>
                      <Card className="h-[10rem] w-[20rem] flex-grow p-6 transition-all hover:bg-accent">
                        <CardTitle className="text-md font-semibold capitalize leading-8 tracking-tight">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">{post.summary}</CardDescription>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div></div>
      </div>
    </div>
  )
}
