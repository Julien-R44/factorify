# Installation

Install the package from npm:

```sh
pnpm add -D @julr/factorify

npm install --save-dev @julr/factorify

yarn add -D @julr/factorify
```

## Usage example

::: tip
Before starting, make sure to check the integrations available. Maybe we are providing a plugin for your test runner.
:::

Before running your tests, you must initialize Factorify with your database configuration.

This must be done **BEFORE** creating models via Factorify. In general, you can use the setup files, or hooks system provided by your test runner.

```ts
import { defineFactorifyConfig } from '@julr/factorify'

// Make sure that piece of code is executed before the tests are run
const disconnect = defineFactorifyConfig({
  database: {
    // See https://knexjs.org/guide/#configuration-options
    // for more information about the possible options
    client: 'sqlite3',
    connection: {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'factorify',
    } 
  },
})

// Once you are done with the tests, you must close the database connection by calling the disconnect function returned by `defineFactorifyConfig`
// For example, in Jest, you can do this in a `afterAll` hook
afterAll(() => disconnect())
```

`defineFactorifyConfig` returns a function that can be used to disconnect from the database.

This is useful when you want to cleanly disconnect from the database after all tests have been run.

> Note: You don't need to do this manually if you are using a test runner integration.


If you are struggling to integrate Factorify with your test runner, feel free to open an issue on the [GitHub repository](https://github.com/Julien-R44/factorify/issues). I will be happy to provide some examples.

## Configuration

### Casing Strategy

You can also define a specific casing strategy. By default, Factorify convert all keys to `snake_case` before inserting the models into the database. And before returning the model, it converts all keys to `camelCase`.

```ts
import { defineFactorifyConfig } from '@julr/factorify'

defineFactorifyConfig({
  casing: {
    // Convert all keys to snake_case before inserting into the database
    insert: 'snake',

    // Convert all keys to camelCase before returning the models
    return: 'camel',
  }
})
```

### Faker Locale

You can also define a specific locale for Faker. By default, Factorify uses the `en` locale.

```ts{4}
import { defineFactorifyConfig } from '@julr/factorify'

defineFactorifyConfig({
  locale: 'fr', 
})
```

