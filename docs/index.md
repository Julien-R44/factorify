# What is Factorify ?

![Factorify](../assets/intro.png)

Have you ever written tests, in which the first 15-20 lines of each test are dedicated to just setting up the database state by using multiple models? With Factorify, you can extract all this set up to a dedicated file and then write the bare minimum code to set up the database state.

Factorify is framework-agnostic, that means you can use it with any test runner or framework. It also support multiple databases ( SQLite, Postgres, MySQL, MSSQL ... )

Built-on top of [Knex](https://knexjs.org) + [Faker](https://fakerjs.dev/), and **heavily** inspired by [Adonis.js](https://adonisjs.com/) and [Laravel](https://laravel.com/).

## Features

- Support for multiple databases ( SQLite, Postgres, MySQL, MSSQL ... )
- Integrations with [test runners](./integrations/japa.md)
- Define variations of your model using [states](./guide/defining-factories.md#states)
- Define [relations](./guide//defining-factories.md#relationships)
- Generate in-memory instances
