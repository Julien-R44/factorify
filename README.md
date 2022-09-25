<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/192137193-cd5727f8-37c3-4523-aeac-52a7c1e3a801.png">
</p>


# @julr/factorify

Framework-agnostic model factory system for clean testing. 

Built-on top of [Knex](https://knexjs.org) + [Faker](https://fakerjs.dev/), and **heavily** inspired by [Adonis.js](https://adonisjs.com/) and [Laravel](https://laravel.com/).

> Have you ever written tests, in which the first 15-20 lines of each test are dedicated to just setting up the database state by using multiple models? With Factorify, you can extract all this set up to a dedicated file and then write the bare minimum code to set up the database state.

## Features
- Support for multiple databases ( SQLite, Postgres, MySQL, MSSQL ... )
- Integrations with [test runners](#integrations)
- Define variations of your model using [states](#factory-states)
- Define [relations](#relationships)
- Generate in-memory instances

## Getting Started

Please follow the documentation at [factorify.julr.dev](https://factorify.julr.dev/) !
