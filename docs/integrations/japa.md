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

## @julr/japa-database-plugin

I recommend you to also use the [@julr/japa-database-plugin](https://github.com/Julien-R44/japa-database-plugin) that extend the Japa matchers with new assertions for the database. Also provide an utility function that allow you to refresh your database between each test :

```ts{5-6,16-18}
import { test } from '@japa/runner'
import { DatabaseUtils } from '@julr/japa-database-plugin'

test.group('My group', group => {
  // 👇 Refresh the database between each test
  group.each.setup(() => DatabaseUtils.refreshDatabase()) 

  test('Should return user', async ({ database, client }) => {
    const user = await UserFactory.merge({ email: 'test@factorify.com' }).create()

    const response = await client.get('/users')
    
    response.assertStatus(200)
    response.assertBody([user])

    // 👇 Simple assertions on the database.
    await database.assertCount('users', 1)
    await database.assertHas('users', { email: 'test@factorify.com' })
  })
})
```



More information here : https://github.com/Julien-R44/japa-database-plugin
