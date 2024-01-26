import { slug } from 'github-slugger'
import { allCoreContent, dateSortDesc, sortPosts } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { allGuides } from 'contentlayer/generated'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import ListLayoutWithTags from '@/layouts/ListLayoutWithTags'

export const metadata = genPageMetadata({
  title: 'Apprendre à invertir en bourse',
  description:
    " Découvrez les fondamentaux de l'investissement en bourse avec ma série d'articles. Pour Débuter votre parcours avec la confiance et les connaissances nécessaires  pour optimiser vos rendements.",
})

export const generateStaticParams = async () => {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const paths = tagKeys.map((tag) => ({
    tag: encodeURI(tag),
  }))
  return paths
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = 'Guide Simple pour commencer à investir'
  const dateKey: string = 'lastmod'
  const filteredPosts = allCoreContent(
    allGuides.sort((a, b) => -1 * dateSortDesc(a[dateKey], b[dateKey]))
  )

  return (
    <div>
      <div className="py-10">
        <h1>Apprendre à invistir en bourse</h1>
        <p>Découvrez les fondamentaux de l'investissement en bourse avec ma série d'articles.</p>
        <p>
          Pour Débuter votre parcours avec la confiance et les connaissances nécessaires pour
          optimiser vos rendements.
        </p>
        <p>
          J'aborde toutes les bases essentielles, des stratégies d'investissement aux concepts clés
          tels que la diversification.
        </p>
      </div>
      <ListLayoutWithTags posts={filteredPosts} title={tag} />
    </div>
  )
}
