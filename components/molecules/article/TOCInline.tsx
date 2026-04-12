import { Toc } from '@/lib/types'

interface TOCInlineProps {
  toc: Toc
  fromHeading?: number
  toHeading?: number
  asDisclosure?: boolean
  exclude?: string | string[]
}

const TOCInline = ({
  toc,
  fromHeading = 1,
  toHeading = 6,
  asDisclosure = false,
  exclude = '',
}: TOCInlineProps) => {
  const re = Array.isArray(exclude)
    ? new RegExp('^(' + exclude.join('|') + ')$', 'i')
    : exclude !== ''
      ? new RegExp('^(' + exclude + ')$', 'i')
      : null

  const filteredToc = toc.filter(
    (heading) =>
      heading.depth >= fromHeading &&
      heading.depth <= toHeading &&
      (re ? !re.test(heading.value) : true)
  )

  const tocList = (
    <ul>
      {filteredToc.map((heading) => (
        <li key={heading.value} className={`${heading.depth >= 3 && 'ml-6'}`}>
          <a href={heading.url}>{heading.value}</a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {asDisclosure ? (
        <details open>
          <summary className="ml-6 pb-2 pt-2 text-xl font-bold">Table of Contents</summary>
          <div className="ml-6">{tocList}</div>
        </details>
      ) : (
        tocList
      )}
    </>
  )
}

export default TOCInline
