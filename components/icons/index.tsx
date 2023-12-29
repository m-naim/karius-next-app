import React from 'react'
import Image from 'next/image'

import Bell from './bell.svg'
import Chart from './chart.svg'
import LightBlub from './lightblub.svg'
import ShareNode from './share-node.svg'
import FileSheild from './file-sheild.svg'
import Annotation from './annotation'

const components = {
  annotation: Annotation,
  bell: Bell,
  chart: Chart,
  lightblub: LightBlub,
  sharenode: ShareNode,
  filesheild: FileSheild,
}

const Icon = ({ kind, size = 6 }) => {
  if (!kind) return null
  const SvgIcon = components[kind]

  return <SvgIcon className={`fill-primary-700 h-${size} w-${size} dark:fill-slate-50`}></SvgIcon>
}

export default Icon
