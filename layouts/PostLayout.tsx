import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import TOCInline from '@/components/TOCInline'
import { Toc } from 'pliny/mdx-plugins'
import { Calendar, ClockIcon } from 'lucide-react'

const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const Socials = () => (
  <div className="pb-6 pt-6 text-sm text-gray-700 dark:text-gray-300">
    <Link href="/" rel="nofollow">
      Discuss on Twitter
    </Link>
    {` • `}
  </div>
)

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
  const { filePath, path, slug, date, title, tags } = content
  const basePath = path.split('/')[0]

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <div>
                <PageTitle>{title}</PageTitle>
              </div>

              <dl className="flex w-full place-content-center gap-6">
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
          </header>
          <div
            className=" divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-5 xl:grid-rows-2 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <div className="divide-y divide-gray-200 xl:order-2 xl:col-span-4 xl:pb-0 dark:divide-gray-700">
              <div className="prose h-full max-w-none overflow-scroll pb-8 pt-10 dark:prose-dark">
                {children}
              </div>
              {/* <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                <Link href={discussUrl(slug)} rel="nofollow">
                  {'En Parler sur Twitter'}
                </Link>
                {` • `}
              </div> */}
            </div>

            <dl className="hidden divide-y divide-gray-200 pb-10 pt-6 xl:order-3 xl:col-span-1 xl:block xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <TOCInline toc={toc} toHeading={3} />
            </dl>

            <footer className="order-3 row-span-2 pb-10 pt-6">
              <div className=" divide-gray-200 text-sm font-medium leading-5 xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
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
                          <Link href={`/fr/${prev.path}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Article suivant
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/fr/${next.path}`}>{next.title}</Link>
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
