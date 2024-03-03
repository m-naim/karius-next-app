import { Features } from '@/components/molecules/home/Features'
import Hero from '@/components/molecules/home/Hero'
import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'

import { genPageMetadata } from 'app/seo'
import { AccordionDemo } from '@/components/AccordionDemo'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = genPageMetadata({
  title: 'Boursehorus | Logiciel de gestion de portefeuilles boursiers',
})

export default async function Page() {
  return (
    <div>
      <section className="flex w-full max-w-screen-xl flex-col place-items-center px-4 py-8 lg:gap-8 lg:py-8 xl:gap-0">
        <div className=" text-center lg:col-span-7">
          <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            Le logiciel de gestion de portefeuilles boursiers
          </h1>
          <p className="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400">
            Analyse et suivis de votre Portefeuille Boursier Comme Jamais Auparavant.
          </p>
        </div>
        <Card className="bg-white p-1">
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
      </section>
      <div className="flex items-center justify-center pt-4">
        <NewsletterForm />
      </div>
      <Features></Features>
      <section>
        <h6 className="pt-8 text-center text-xl font-light "> Rejoignez la communauté</h6>
        <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:px-6 lg:py-16">
          <dl className="mx-auto grid max-w-screen-md gap-8 text-gray-900 sm:grid-cols-3 dark:text-white">
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold md:text-4xl">+ de 10</dt>
              <dd className="font-light text-primary dark:text-primary">Utilisateurs inscrits</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold md:text-4xl">+ de 15</dt>
              <dd className="font-light text-primary dark:text-primary">Portefeuilles Crées</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-3xl font-extrabold md:text-4xl">+ de 20</dt>
              <dd className="text-lg font-light text-primary dark:text-primary">
                watch liste Crées
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <section>
        <AccordionDemo></AccordionDemo>
      </section>
    </div>
  )
}
