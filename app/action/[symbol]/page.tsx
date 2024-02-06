import { Input } from '@/components/ui/input'
import siteMetadata from '@/data/siteMetadata'
import { findStockBySymbol } from '@/services/actions'
import NotFound from 'app/not-found'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { symbol: string }
}): Promise<Metadata | undefined> {
  const { symbol } = params

  const stock = await findStockBySymbol(symbol.toUpperCase())

  if (stock == null) return {}

  const title = `${symbol}| Cours Action ${stock.longname}, Cotation Bourse ${symbol}`
  const summary = `${symbol} Cours Action ${symbol}, Cotation Bourse ${symbol}, graphique, analyses et informations boursières'`
  const publishedAt = new Date(2024, 1, 30).toISOString()
  const modifiedAt = new Date().toISOString()

  const imageList = [siteMetadata.socialBanner]
  const ogImages = imageList.map((img) => {
    return {
      url: img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: title,
    description: summary,
    openGraph: {
      title: title,
      description: summary,
      siteName: title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: summary,
      images: ogImages,
    },
  }
}

async function page({ params }: { params: { symbol: string } }) {
  const stock = await findStockBySymbol(params.symbol.toUpperCase())
  if (stock == null) return <NotFound />
  return (
    <div>
      <Input></Input>

      <div className="flex w-full flex-col place-items-center">
        <h1>Cours de l'Action {stock.longname}</h1>
        <h2 className="uppercase">
          {params.symbol} | {stock.exchange}
        </h2>
        <div className="flex gap-4">
          <span className="text-2xl">300 €</span>
          <div className="flex gap-2 divide-x rounded-md bg-red-400 p-1 dark:bg-red-700">
            <span className="text-md dark:text-white"> +30</span>
            <span className="text-md dark:text-white"> +30%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap-reverse place-content-between">
        <p className="min-w-[30rem]">discreption!!</p>

        <div>
          <div className="flex place-items-end gap-10">
            <h2 className="p-0 text-xl">Secteur</h2>
            <span className="text-lg">{stock.sector}</span>
          </div>

          <div className="flex place-items-end gap-10">
            <h2 className="p-0 text-xl">Industrie</h2>
            <span className="text-lg">{stock.industry}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap place-content-around gap-3">
        <div>
          <h2 className="text-xl">Cash flow</h2>
          <h3>Croissance FCF</h3>
          <span className="text-lg">300</span>
        </div>
        <div>
          <h2 className="text-xl">Marges</h2>
          <h3>ROIC</h3>
          <span className="text-lg">300</span>
        </div>
        <div>
          <h2 className="text-xl">FCF marge</h2>
          <span className="text-lg">300</span>
        </div>
        <div>
          <h2 className="text-xl">FCF yeid</h2>
          <span className="text-lg">300</span>
        </div>

        <div>
          <h2 className="text-xl">Dividendes</h2>
          <span className="text-lg">300</span>
        </div>
      </div>

      <div>
        <h2>Analyses</h2>
        <span className="text-2xl">http</span>
      </div>
    </div>
  )
}

export default page
