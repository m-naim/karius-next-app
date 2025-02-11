import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'

import { genPageMetadata } from 'app/seo'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircleIcon } from 'lucide-react'
import SectionContainer from '@/components/organismes/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = genPageMetadata({
  title: 'Boursehorus | L’application de simulation de portefeuilles boursiers ',
})

export default async function Page() {
  return (
    <div>
      <SectionContainer className="flex flex-col content-center">
        <div className=" flex flex-col items-center p-6 text-center lg:col-span-7">
          <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl xl:text-5xl dark:text-white">
            L'application de simulation de portefeuilles boursiers
          </h1>
          <ul className="my-12 list-inside ">
            <li className="my-2 flex gap-2">
              <CheckCircleIcon className="mt-2 h-4 w-4 text-green-600 "></CheckCircleIcon>
              <div className="flex flex-col gap-0 ">
                <span>
                  Simuler des investissements boursiers sans risque, avec de l'argent virtuel.
                </span>
              </div>
            </li>

            <li className="my-2 flex gap-2">
              <CheckCircleIcon className="mt-2 h-4 w-4 text-green-600 "></CheckCircleIcon>
              vous pouvez faire autant de simulation que vous voulez.
            </li>
          </ul>

          <Button className="m-6 w-fit self-center px-6">
            <Link data-umami-event="landing-try-button" href={'/signup'}>
              Essayer Gratuitement
            </Link>
          </Button>
        </div>
        <Card className="halo w-fit self-center bg-white p-1">
          <CardContent className="p-1">
            <Image
              className="p-1"
              alt="image décrivant a quoi ressemble le produit"
              src="/static/images/product/portfolio-page.png"
              width={750}
              height={300}
              sizes="50"
            />
          </CardContent>
        </Card>
      </SectionContainer>

      <SectionContainer className="mt-16">
        <h2 className="text-center">Comment créer un portefeuille virtuel ?</h2>

        <div>
          <h3>
            <span className="mr-4 h-4 w-4 rounded-full bg-primary px-3 py-1 text-white">1</span>{' '}
            S’inscrire
          </h3>
        </div>

        <div>
          <h3>
            <span className="mr-4 h-4 w-4 rounded-full bg-primary px-3 py-1  text-white">2</span>{' '}
            Créer un nouveau portefeuille virtuel
          </h3>
        </div>

        <div>
          <h3>
            <span className="mr-4 h-4 w-4 rounded-full bg-primary px-3 py-1  text-white">3</span>{' '}
            Ajouter des actions, Etfs et cryptomonnaies
          </h3>
        </div>

        <div>
          <h3>
            <span className="mr-4 h-4 w-4 rounded-full bg-primary px-3 py-1  text-white">4</span>{' '}
            vous pouvez maintenant vérifier vous Performances
          </h3>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-12">
        <li className="flex gap-2">
          <CheckCircleIcon className="text-green-600"></CheckCircleIcon>
          vous pouvez vous comparer vos simulations aux autres simulations de la communauté.
        </li>
      </SectionContainer>

      <div className="flex items-center justify-center pt-4">
        <NewsletterForm />
      </div>
    </div>
  )
}
