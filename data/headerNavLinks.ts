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
      { href: '/app/market/SPY', title: 'S&P 500' },
      { href: '/app/market/QQQ', title: 'Nasdaq 100' },
      { href: '/app/market/FCHI', title: 'CAC 40' },
      { href: '/app/market/QWLD', title: 'msci world quality' },
      { href: '/app/market/SBF.PAR', title: 'SBF 120 Index' },
      { href: '/app/market/EXSA.DEX', title: 'STOXX Europe 600 Index' },
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
