import { defineConfig } from 'vitepress'


export default defineConfig({
  title: 'Factorify',
  description: 'Just playing around.',

  head: [['link', { rel: 'icon', href: '/logo.png' }]],

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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/julien-r44/factorify/' },
      { icon: 'twitter', link: 'https://twitter.com/julien_rpt' }
    ],

    outline: 'deep'
  }
})
