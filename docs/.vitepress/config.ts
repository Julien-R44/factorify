import { defineConfig } from 'vitepress'


export default defineConfig({
  lang: 'en-US',
  title: 'Factorify',
  description: 'Node.js framework-agnostic model factories for clean testing',

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    [
      'meta',
      { name: 'twitter:image', content: 'https://factorify.julr.dev/banner.png', }
    ],
    ['meta', { name: 'twitter:site', content: '@julien_rpt' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],

  themeConfig: {
    siteTitle: 'Factorify',
    logo: '/logo.png',


    nav: [
      { text: 'Release Notes', link: 'https://github.com/Julien-R44/factorify/releases' },
      { text: 'Sponsoring', link: 'https://github.com/sponsors/Julien-R44' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Installation', link: '/getting-started/installation' },
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'Defining factories', link: '/guide/defining-factories' },
          { text: 'Using factories', link: '/guide/using-factories' },
        ]
      },
      {
        text: 'Integrations',
        items: [
          { text: 'Japa', link: '/integrations/japa' },
        ]
      },
    ],

    algolia: {
      appId: 'E5R26D6CBG',
      apiKey: '7b5cac7aac51ad74667bb0ecbc376f8e',
      indexName: 'factorify',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/julien-r44/factorify/' },
      { icon: 'twitter', link: 'https://twitter.com/julien_rpt' }
    ],


    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/Julien-R44/factorify/tree/main/docs/:path'
    },

    outline: 'deep'
  }
})
