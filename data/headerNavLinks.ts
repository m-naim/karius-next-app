const isProduction = process.env.NODE_ENV === 'production'

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { draft: false, href: '/app/portfolios', title: 'Portefeuilles' },
  { draft: false, href: '/app/watchlist', title: 'Watchlists' },
  { draft: false, href: '/app/alerts', title: 'Alertes' },
  {
    draft: false,
    title: 'Marchés',
    href: '/app/market',
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
