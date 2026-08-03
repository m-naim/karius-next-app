import { defineConfig } from 'tinacms'

const branch =
  process.env.HEAD ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  'main'

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Blog',
        path: 'data/blog',
        format: 'mdx',
        ui: {
          router: ({ document }) => `/fr/blog/${document._sys.filename}`,
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Titre',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date de publication',
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Résumé',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description SEO',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Brouillon',
          },
          {
            type: 'image',
            name: 'images',
            label: 'Images',
            list: true,
          },
          {
            type: 'string',
            name: 'authors',
            label: 'Auteurs',
            list: true,
          },
          {
            type: 'string',
            name: 'layout',
            label: 'Layout',
          },
          {
            type: 'string',
            name: 'canonicalUrl',
            label: 'URL Canonique',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Contenu Article (MDX)',
            isBody: true,
          },
        ],
      },
      {
        name: 'guide',
        label: 'Guides',
        path: 'data/guide',
        format: 'mdx',
        ui: {
          router: ({ document }) => `/fr/guide/${document._sys.filename}`,
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Titre',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Résumé',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description SEO',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Brouillon',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Contenu (MDX)',
            isBody: true,
          },
        ],
      },
      {
        name: 'analyse',
        label: 'Analyses Actions',
        path: 'data/analyse',
        format: 'mdx',
        ui: {
          router: ({ document }) => `/fr/analyse/${document._sys.filename}`,
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Titre',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Résumé',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description SEO',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Brouillon',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Contenu (MDX)',
            isBody: true,
          },
        ],
      },
      {
        name: 'authors',
        label: 'Auteurs',
        path: 'data/authors',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'name',
            label: 'Nom',
            isTitle: true,
            required: true,
          },
          {
            type: 'image',
            name: 'avatar',
            label: 'Avatar',
          },
          {
            type: 'string',
            name: 'occupation',
            label: 'Métier / Role',
          },
          {
            type: 'string',
            name: 'company',
            label: 'Société',
          },
          {
            type: 'string',
            name: 'email',
            label: 'Email',
          },
          {
            type: 'string',
            name: 'twitter',
            label: 'Twitter',
          },
          {
            type: 'string',
            name: 'linkedin',
            label: 'LinkedIn',
          },
          {
            type: 'string',
            name: 'github',
            label: 'GitHub',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Bio (MDX)',
            isBody: true,
          },
        ],
      },
    ],
  },
})
