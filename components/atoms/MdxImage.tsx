import React from 'react'
import Image, { ImageProps } from 'next/image'

export function MdxImage(props: ImageProps) {
  return (
    <div>
      <Image {...props} alt={props.alt} />
      <p className="text-center">{props.alt}</p>
    </div>
  )
}
