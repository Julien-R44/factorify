# @julr/vitest-factorio-plugin

The Vitest plugin for Factorio.

## Installation

```bash
pnpm add @julr/vitest-factorio-plugin
```

```ts
// bin/test.ts

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    plugins: [
      factorio({
        database: {
          // See https://knexjs.org/guide/#configuration-options
          // for more information
          connection: {
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'factorio',
          } 
        },
      }),
    ],
  },
  // ...
})

// ...
```
