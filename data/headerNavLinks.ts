const isProduction = process.env.NODE_ENV === 'production'

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { draft: false, href: '/app/portfolios', title: 'Portefeuilles' },
  { draft: false, href: '/app/watchlist', title: 'Watchlists' },
  {
    draft: true,
    title: 'Marchés',
    href: '#',
    children: [
      { href: '/app/market/%5ENDX', title: 'NASDAQ 100' },
      { href: '/app/market/%5EDJI', title: 'Dow Jones' },
    ],
  },
  {
    title: 'Ressources',
    href: '#',
    children: [
      { href: '/fr/analyse', title: 'Analyses' },
      { href: '/fr/guide', title: 'Apprendre' },
      { href: '/fr/blog', title: 'Blog' },
    ],
  },
]

export default headerNavLinks
