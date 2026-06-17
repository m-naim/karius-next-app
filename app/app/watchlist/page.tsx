import SectionContainer from '@/components/organismes/layout/SectionContainer'
import watchListService from '@/services/watchListService'
import { WatchCard } from './watchlistCard'
import { MyWatchLists } from './myWatchlist'

export interface WatchListInfos {
  _id?: string
  id?: string
  name: string
  securities: { symbol: string }[]
  createdAt: string
  updatedAt: string
}

export default async function watchlistPage() {
  try {
    const listWatch = await watchListService.getPublic()

    return (
      <div className="space-y-2 py-2">
        <MyWatchLists />

        <SectionContainer className="space-y-8">
          <div className="flex w-full flex-col items-center px-4 text-center">
            <h1 className="max-w-3xl text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              Portefeuilles de la Communauté
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-500 sm:text-base">
              Explorez les meilleures stratégies et laissez-vous inspirer par les investisseurs les plus performants.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listWatch.map((w, index) => (
              <WatchCard key={w._id?.toString() || w.id?.toString() || index} data={w} />
            ))}
          </div>
        </SectionContainer>
      </div>
    )
  } catch (e) {
    console.error('err', e)
    return <p>err {e.toString()}</p>
  }
}
