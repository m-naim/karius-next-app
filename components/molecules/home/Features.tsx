import React from 'react'
import Icon from '@/components/icons'

const features = [
  {
    icon: 'chart',
    title: 'Tracker votre portfolio',
    description:
      'Suivrez vos performances et comparer vos performances les indices et les autres portefeuilles.',
  },
  {
    icon: 'annotation',
    title: 'Saisie facile',
    description: "Importer votre portefeuille a partir d'un fichier Excel.",
  },
  {
    icon: 'lightblub',
    title: 'Inspirez vous',
    description: 'Recherche simple de portefeuilles Plein de statistiques sur les portefeuilles',
  },
  {
    icon: 'sharenode',
    title: 'Partagez',
    description:
      'Partager vous portefeuilles avec vos amis et la communauté Comparer les performances et autres statistiques',
  },
  {
    icon: 'filesheild',
    title: 'Calcule des Impôts',
    description: 'Gérer automatiquement le rapport pour Impôts à payer',
  },
  {
    icon: 'bell',
    title: 'Alertes intelligentes',
    description:
      'Soyez informés en temps réel des transactions des portefeuilles que vos Suivez Notifications programmées.',
  },
]

export const Features = () => {
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6">
        <div className="mb-8 max-w-screen-lg lg:mb-16">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Fonctionnalités sur Mesure pour un Investissement Personnel Optimal.
          </h2>
          <p className="text-gray-500 sm:text-xl dark:text-gray-400">
            écouvrez des fonctionnalités conçues exclusivement pour répondre aux besoins de
            l'investisseur particulier. De la gestion de portefeuille intuitive aux analyses
            personnalisées, notre application offre une expérience transparente, éducative et
            centrée sur vous. Plongez dans une nouvelle ère d'investissement, façonnée pour faire
            évoluer vos stratégies vers de nouveaux sommets.
          </p>
        </div>

        <div className="space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
          {features.map((f) => (
            <Item title={f.title} description={f.description} icon={f.icon} key={f.icon} />
          ))}
        </div>
      </div>
    </section>
  )
}

const Item = ({ title, description, icon }) => (
  <div>
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
      <Icon kind={icon} />
    </div>
    <h3 className="mb-2 text-xl font-bold dark:text-white">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400">{description}</p>
  </div>
)
