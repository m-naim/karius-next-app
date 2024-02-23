import PortfoliosList from '@/components/molecules/portfolio/PortfoliosList'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getPublicPortfolios } from '@/services/actions'
import { Star, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

const Portfolios = async () => {
  const publicPortfolios = await getPublicPortfolios()
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div>
        <h1>Titre</h1>
        <p>description</p>
      </div>

      <div className="-m-4 flex w-full flex-wrap place-content-center gap-6 p-6">
        {publicPortfolios.map((w) => PortfolioCard(w))}
      </div>
    </div>
  )
}

export default Portfolios

function PortfolioCard(p): React.JSX.Element {
  return (
    <Link key={p._id} href={`portfolios/${p._id}`}>
      <Card className="flex h-44 w-[20rem] flex-col place-content-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1">
          <CardTitle className="text-md text-ellipsis font-medium capitalize">{p.name}</CardTitle>
          <div className="flex place-items-center gap-1 rounded-md bg-gray-100 p-1">
            <Star size={16} />
            <span className="xs px-1">0</span>
          </div>
        </CardHeader>
        <CardContent className="min-h-26 h-16">
          <div className="text-xs font-light">{p.allocation?.length || 0} Actions</div>
          <div className="flex w-full flex-wrap">
            {p.allocation
              ?.filter((element, index) => index < 10)
              .map((s) => (
                <span
                  key={s.symbol}
                  className="m-0.5 rounded-sm bg-primary p-0.5 text-xs uppercase text-white"
                >
                  {s.symbol}
                </span>
              ))}
            {p?.allocation.length < 10 || (
              <span className="m-0.5 rounded-sm bg-primary p-0.5 text-xs uppercase text-white">
                + autres ...
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <span className="capitalize">performances annualisées</span>
            <TrendingUpIcon></TrendingUpIcon>
            <span>30%</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

{
  /* <PortfoliosList /> */
}
