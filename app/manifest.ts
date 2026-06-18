import type { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteMetadata.title,
    short_name: 'Bourse Horus',
    description: siteMetadata.description,
    start_url: '/app',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/static/favicons/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/static/favicons/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/static/favicons/apple-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
  }
}
