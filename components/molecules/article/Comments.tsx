'use client'

import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  return (
    <>
      {!loadComments && <button onClick={() => setLoadComments(true)}>Load Comments</button>}
      {
        siteMetadata.comments && loadComments && null
        // <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      }
    </>
  )
}
