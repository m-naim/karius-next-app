const isProduction = process.env.NODE_ENV === 'production'

const routesData = [
  {
    href: '',
    lastMod: new Date(2024, 1, 25).toISOString().split('T')[0],
  },
  {
    href: 'fr/blog',
    lastMod: new Date(2024, 1, 7).toISOString().split('T')[0],
  },
  {
    href: 'fr/analyse',
    lastMod: new Date(2024, 1, 25).toISOString().split('T')[0],
  },
  {
    href: 'fr/guide',
    lastMod: new Date(2024, 1, 25).toISOString().split('T')[0],
  },
  {
    href: '/fr/simulation-portefeuille-bourse',
    lastMod: new Date(2024, 1, 25).toISOString().split('T')[0],
  },
]

const footerRoutes = [
  {
    key: 1,
    category: '',
    routes: [
      {
        href: '/fr/simulation-portefeuille-bourse',
        title: 'Simulation portefeuille boursier',
      },
    ],
  },
  {
    key: 2,
    category: '',
    routes: [
      {
        href: '/fr/analyse',
        title: 'Analyses',
      },
      {
        href: '/fr/blog',
        title: 'Blog',
      },
      {
        href: '/fr/guide',
        title: 'Apprendre la bourse',
      },
      {
        href: '/fr/blog/a-propos',
        title: 'à propos',
      },
    ],
  },
  {
    key: 3,
    category: '',
    routes: [
      {
        href: '',
        title: 'Privacy Policy',
      },
      {
        href: '',
        title: 'Terms & Conditions',
      },
    ],
  },
]
export { routesData, footerRoutes }
