import { allCoreContent } from '@/lib/contentlayer'
import { allGuides } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import Link from 'next/link'
import { BookOpen, GraduationCap, ArrowRight, PlayCircle, ShieldCheck, Rocket, Trophy, Target } from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = genPageMetadata({
  title: 'Apprendre à investir en bourse | Académie Boursehorus',
  description: "De zéro à investisseur autonome. Suivez notre parcours étape par étape pour maîtriser les marchés financiers.",
})

import { GameMapClient } from '@/components/molecules/guide/GameMapClient'

// Définition des "Phases" et de leurs articles (par slug)
const CURRICULUM = [
  {
    title: "Phase 1 : Les Fondations",
    goal: "Comprendre les règles du jeu, éviter les pièges mortels des débutants et forger un mental d'acier.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
    color: "from-blue-500/20 to-transparent",
    borderColor: "border-blue-500/30",
    slugs: [
      "guide/introduction-a-l-investissement",
      "guide/pourquoi-investir-en-bourse",
      "guide/les-risques-de-l-investissement-en-bourse",
      "guide/psychologie-investisseur"
    ]
  },
  {
    title: "Phase 2 : Le Stratège",
    goal: "Définir votre profil, choisir la bonne enveloppe fiscale et construire un portefeuille solide.",
    icon: <Rocket className="h-6 w-6 text-emerald-500" />,
    color: "from-emerald-500/20 to-transparent",
    borderColor: "border-emerald-500/30",
    slugs: [
      "guide/les-principaux-styles-d-investissement",
      "guide/investissement-passif-vs-actif",
      "guide/pea-ou-compte-titres",
      "guide/construire-portefeuille-boursier"
    ]
  },
  {
    title: "Phase 3 : L'Autonome",
    goal: "Savoir évaluer une action, ouvrir son courtier, passer des ordres et automatiser avec le DCA.",
    icon: <Trophy className="h-6 w-6 text-amber-500" />,
    color: "from-amber-500/20 to-transparent",
    borderColor: "border-amber-500/30",
    slugs: [
      "guide/ou-trouver-les-actions-a-acheter",
      "guide/ratios",
      "guide/comment-choisir-courtier",
      "guide/la-strategie-dca"
    ]
  }
]

export default async function GuidePage() {
  const allPosts = allCoreContent(allGuides)

  // Hydratation du curriculum avec les vrais articles
  const hydratedCurriculum = CURRICULUM.map(phase => ({
    ...phase,
    posts: phase.slugs.map(slug => allPosts.find(p => p.path === slug)).filter(Boolean)
  }))

  return (
    <div className="relative overflow-hidden pb-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <SectionContainer className="pt-10 pb-4">
        {/* En-tête Condensé */}
        <div className="relative mb-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          <h1 className="mb-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            Votre plan vers <span className="text-primary">l'indépendance.</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Suivez cet entraînement étape par étape pour transformer le débutant hésitant en un investisseur confiant.
          </p>
        </div>

        <GameMapClient curriculum={hydratedCurriculum} />
      </SectionContainer>
    </div>
  )
}
