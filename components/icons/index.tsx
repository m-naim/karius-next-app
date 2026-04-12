import React from 'react'
import Bell from './BellIcon'
import Chart from './ChartIcon'
import LightBlub from './LightBulbIcon'
import ShareNode from './ShareNodeIcon'
import FileSheild from './FileShieldIcon'
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
  if (!SvgIcon) return null

  return <SvgIcon className={`h-${size} w-${size} fill-primary`} />
}

export default Icon
