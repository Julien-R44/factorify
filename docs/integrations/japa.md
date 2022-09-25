# Japa integration

[Japa](https://japa.dev) is a test runner that focuses only on testing backend applications and library written for the Node.js runtime. It is developped by the [Adonis.js](https://adonisjs.com/) team.

We provide an integration plugin for Japa, that you can install as follows :

```bash
pnpm add -D @julr/japa-factorify-plugin
```

## Usage

Once the plugin is installed, you must add the plugin in your Japa configure as follows : 

```ts
// bin/test.ts
import { factorify } from '@julr/japa-factorify-plugin'

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    // ...
    plugins: [
      factorify({
        database: {
          // See https://knexjs.org/guide/#configuration-options
          // for more information
          connection: {
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'factorify',
          } 
        },
      }),
    ],
  },
})

// ...
```
Since Factorify is built on top of Knex, see more information about the database configuration [here](https://knexjs.org/guide/#configuration-options).

The plugin will automatically open, and close the database connection after the tests are done.


