# @julr/japa-factorify-plugin

The Japa plugin for Factorify.

## Installation

```bash
pnpm add @julr/japa-factorify-plugin
```

```ts
// bin/test.ts

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
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
  // ...
})

// ...
```
