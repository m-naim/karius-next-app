import { NewsletterForm } from '@/components/molecules/ui/NewsletterForm'

import { genPageMetadata } from 'app/seo'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircleIcon } from 'lucide-react'

export const metadata = genPageMetadata({
  title: 'Boursehorus | L’application de simulation de portefeuilles boursiers ',
})

export default async function Page() {
  return (
    <div>
      <section className="flex w-full max-w-screen-xl flex-col place-items-center px-4 py-8 lg:gap-8 lg:py-8 xl:gap-0">
        <div className=" text-center lg:col-span-7">
          <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            L'application de simulation de portefeuilles boursiers
          </h1>
          <ul className="my-12  list-inside ">
            <li className="flex gap-2">
              <CheckCircleIcon className="text-green-600"></CheckCircleIcon>
              les données sont mise à jour quotidiennement. ideal pour les investisseur moyen long
              terme
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon className="text-green-600"></CheckCircleIcon>
              vous pouvez autant de simulation que vous voulez.
            </li>
            <li className="flex gap-2">
              <CheckCircleIcon className="text-green-600"></CheckCircleIcon>
              vous pouvez vous comparer vos simulations aux autres simulations de la communauté.
            </li>
          </ul>
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
      <section></section>
    </div>
  )
}
