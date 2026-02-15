const isProduction = process.env.NODE_ENV === 'production'

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { draft: false, href: '/app/portfolios', title: 'Portefeuilles' },
  { draft: false, href: '/app/watchlist', title: 'Watchlists' },
  {
    draft: false,
    title: 'Marchés',
    href: '#',
    children: [
      { href: '/app/market/%5EDJI', title: 'Dow Jones' },
      { href: '/app/market/QQQ', title: 'Nasdaq 100' },
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
