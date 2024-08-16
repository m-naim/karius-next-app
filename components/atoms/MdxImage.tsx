import React from 'react'
import Image, { ImageProps } from 'next/image'

export function MdxImage(props: ImageProps) {
  return <Image {...props} alt={props.alt} />
}
