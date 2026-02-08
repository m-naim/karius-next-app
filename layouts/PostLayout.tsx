import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Link from '@/components/atoms/Link'
import PageTitle from '@/components/molecules/article/PageTitle'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import Tag from '@/components/molecules/article/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/molecules/article/ScrollTopAndComment'
import { Toc } from 'pliny/mdx-plugins'
import { Calendar, ClockIcon } from 'lucide-react'
import { PositionScrollDisplay } from '@/components/ui/positionScrollDisplay'

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
  readingTime: string
  toc: Toc
}

export default function PostLayout({
  content,
  toc,
  authorDetails,
  next,
  prev,
  readingTime,
  children,
}: LayoutProps) {
  const { filePath, path, slug, date, title, tags, images } = content
  const basePath = path.split('/')[0]
  const displayImage =
    images && images.length > 0 ? images[0] : 'https://picsum.photos/seed/picsum/800/400'

  const fromHeading = 1
  const toHeading = 3

  const filteredToc = toc.filter(
    (heading) => heading.depth >= fromHeading && heading.depth <= toHeading
  )

  const tocList = (
    <ul className="sticky top-0 mt-12 border-l-4 p-4 py-12 ">
      {filteredToc.map((heading) => (
        <li key={heading.value} className={`${'ml-6'}`}>
          <a href={heading.url} className="h target:text-blue-600 hover:text-blue-600">
            {heading.value}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <SectionContainer>
      <PositionScrollDisplay />
      <ScrollTopAndComment />
      <article>
        <div className="divide-y divide-gray-200 pb-12 dark:divide-gray-700">
          <header className="divide-y divide-gray-200 pb-2">
            <div className="flex flex-col gap-12 space-y-1 md:flex-row">
              <div>
                <PageTitle>{title}</PageTitle>
                <dl className="place-content-center gap-6">
                  <div className="flex gap-1">
                    <dt className="sr-only">Published on</dt>
                    <Calendar />
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>
                        {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                      </time>
                    </dd>
                  </div>

                  <div className="flex gap-1">
                    <dt className="sr-only">Reading time</dt>
                    <ClockIcon />
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                      <time>{readingTime} min de lecture</time>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </header>
          <div
            className=" divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-5 xl:grid-rows-2 xl:gap-x-12 xl:divide-y-0"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:order-2 xl:col-span-4 xl:pb-0">
              <div className="prose h-full max-w-none overflow-scroll  pb-8 pt-10 dark:prose-dark prose-h2:text-3xl prose-h3:text-primary prose-p:my-8">
                {children}
              </div>
            </div>

            <dl className="hidden divide-y divide-gray-200 pb-10 pt-6 xl:order-3 xl:col-span-1 xl:block xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <details open className="sticky top-0 mt-12 border-l-4 p-4 py-12 ">
                <summary className="pb-2 pt-2 text-lg font-bold">Table du Contenu</summary>
                <ul className="ml-6">
                  {filteredToc
                    .filter((heading) => heading.depth == 2)
                    .map((heading) => (
                      <li
                        key={heading.value}
                        className={`mx-2 my-3 list-disc leading-tight ${
                          heading.depth >= 3 && 'ml-6'
                        }`}
                      >
                        <a
                          data-umami-event={`post-toc-${heading.value}`}
                          href={heading.url}
                          className=" target:text-blue-600 hover:text-blue-600"
                        >
                          {heading.value}
                        </a>
                      </li>
                    ))}
                </ul>
              </details>
            </dl>

            <footer className="order-3 row-span-2 pb-10 pt-6">
              <div className=" divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Article précédent
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link data-umami-event={`post-prev-${title}`} href={`/fr/${prev.path}`}>
                            {prev.title}
                          </Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Article suivant
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link data-umami-event={`post-next-${title}`} href={`/fr/${next.path}`}>
                            {next.title}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
