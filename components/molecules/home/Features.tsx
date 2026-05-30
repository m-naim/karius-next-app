'use client'
import React from 'react'
import { motion } from 'framer-motion'
import Icon from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: 'chart',
    title: 'Suivez vos performances',
    description:
      'Suivez en temps réel et comparez vos performances avec les grands indices et autres portefeuilles.',
  },
  {
    icon: 'annotation',
    title: 'Saisie ultra-rapide',
    description: "Importez l'intégralité de votre portefeuille en un clic à partir d'un fichier Excel.",
  },
  {
    icon: 'lightblub',
    title: 'Inspirez-vous',
    description:
      'Découvrez les portefeuilles de la communauté. Analysez-les grâce à des statistiques poussées.',
  },
  {
    icon: 'sharenode',
    title: 'Partagez',
    description:
      'Partagez vos portefeuilles avec vos amis et comparez vos stratégies et rendements.',
  },
  {
    icon: 'filesheild',
    title: 'Calcul des impôts',
    description: 'Générez automatiquement vos rapports pour faciliter vos déclarations fiscales.',
  },
  {
    icon: 'bell',
    title: 'Alertes intelligentes',
    description:
      'Recevez des notifications en temps réel sur les transactions des portefeuilles que vous suivez.',
  },
]

export const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-6">
        <div className="mb-12 flex flex-col items-center text-center lg:mb-20">
          <h2 className="mb-4 max-w-3xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Des outils pensés pour votre <span className="text-primary">performance</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Tout ce dont vous avez besoin pour gérer, analyser et optimiser vos investissements, 
            réuni dans une interface claire et sans friction.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.icon} variants={itemVariants} className="flex">
              <Item title={f.title} description={f.description} icon={f.icon} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const Item = ({ title, description, icon }) => (
  <Card className="group relative flex h-full w-full flex-col overflow-hidden border-border/40 bg-transparent shadow-none transition-all duration-300 hover:bg-muted/30 hover:border-border/80">
    <CardHeader className="pb-3 pt-6 px-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-sm">
        <Icon kind={icon} />
      </div>
      <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="px-6 pb-6 pt-0">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>
)
