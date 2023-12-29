import { Features } from '@/components/molecules/home/Features';
import Hero from '@/components/molecules/home/Hero';
import NewsletterForm from 'pliny/ui/NewsletterForm';
// import { BlogNewsletterForm } from '@/components/mdx/NewsletterForm'


const Home = () => (
  <>
    <Hero></Hero>
    <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
      </div>
    <Features></Features>
    <section >
      <h6 className="pt-8 text-center font-light text-xl "> Rejoignez la communauté</h6>
      <div className="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
        <dl className="grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white">
          <div className="flex flex-col items-center justify-center">
            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">+ de 10</dt>
            <dd className="font-light text-primary-500 dark:text-primary-400">Utilisateurs inscrits</dd>
          </div>
          <div className="flex flex-col items-center justify-center">
            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">+ de 15</dt>
            <dd className="font-light text-primary-500 dark:text-primary-400">Portefeuilles Crées</dd>
          </div>
          <div className="flex flex-col items-center justify-center">
            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">+ de 20</dt>
            <dd className="font-light text-lg text-primary-500 dark:text-primary-400">watch liste Crées</dd>
          </div>
        </dl>
      </div>
    </section>

    {/* <BlogNewsletterForm title="Vous voulais etre informé lors de l'overture de l'application?"></BlogNewsletterForm> */}
  </>
)

export default Home