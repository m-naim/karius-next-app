import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link href={`?tag=${slug(text)}`} className="mr-3 text-sm font-medium uppercase text-primary ">
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
