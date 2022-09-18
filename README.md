<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/190899724-d289bae9-ccf1-493e-956e-79a42033d927.png">
</p>


# @julr/factorio

Framework-agnostic model factory system for clean testing. 

Built-on top of [Knex](https://knexjs.org) + [Faker](https://fakerjs.dev/), and **heavily** inspired by [Adonis.js](https://adonisjs.com/) and [Laravel](https://laravel.com/).

> Have you ever written tests, in which the first 15-20 lines of each test are dedicated to just setting up the database state by using multiple models? With Factorio, you can extract all this set up to a dedicated file and then write the bare minimum code to set up the database state.

🚧 **This is a work in progress. Package isn't published yet**

## Table of Contents
* [Features](#features)
* [Installation](#installation)
* [Integrations](#integrations)
* [Defining database connection](#defining-database-connection)
* [Creating factories](#creating-factories)
* [Using factories](#using-factories)
* [Merging attributes](#merging-attributes)
* [Factory states](#factory-states)
* [Relationships](#relationships)
  + [Applying relationship states](#applying-relationship-states)

## Features
- Support for multiple databases ( SQLite, Postgres, MySQL, MSSQL ... )
- Integrations with [test runners](#integrations)
- Define variations of your model using [states](#factory-states)
- Define [relations](#relationships)

## Installation
  
```bash
pnpm install @julr/factorio
```

## Integrations

Integrations for some test runners are available below :

- [Japa](./packages/japa-plugin/)

## Defining database connection

Before running your tests, you must initialize Factorio with your database configuration. 

This must be done **BEFORE** creating models via Factorio. In general, you can use the setup files system provided by the test runners.

```ts
const disconnect = defineFactorioConfig({ 
  // See https://knexjs.org/guide/#configuration-options
  // for more information
  database: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'factorio',
    } 
  }
})

// Once you are done with your tests, you can disconnect from the database
await disconnect()
```

`defineFactorioConfig` returns a function that can be used to disconnect from the database. 

This is useful when you want to cleanly disconnect from the database after all tests have been run.

## Creating factories

```ts
import type { User } from './my-user-interface.js'

const UserFactory = defineFactory<Partial<User>>(({ faker }) => ({
  tableName: 'user',
  fields: { 
    email: faker.internet.email(), 
    referralCode: faker.random.alphaNumeric(6) 
  },
})).build()
```

Make sure that you return an object with all the required properties, otherwise the database will raise not null exceptions.

## Using factories

```ts
import { UserFactory } from './my-factory.js'

const user = await UserFactory.create()
const users = await UserFactory.createMany(10)
```

## Merging attributes

You can override the default set of attributes using the `.merge` method. For example:

```ts
await UserFactory
  .merge({ email: 'test@example.com' })
  .create()
```

When creating multiple instances, you can define an array of attributes and they will merge based upon their indices. For example:

```ts
await UserFactory
  .merge([
    { email: 'foo@example.com' },
    { email: 'bar@example.com' },
  ])
  .createMany(3)
```

In the above example

- The first user will have the email of `foo@example.com`.
- The second user will have the email of `bar@example.com`.
- And, the third user will use the default email address, since the merge array has a length of 2.

## Factory states

Factory states allow you to define variations of your factories as states. For example: On a Post factory, you can have different states to represent published and draft posts.

```ts
export const PostFactory = defineFactory<Partial<Post>>(({ faker }) => ({
    tableName: 'post',
    fields: {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(4),
      status: 'DRAFT',
    }
  }))
  .state('published', (attributes) => ({
    status: 'PUBLISHED', // 👈
  }))
  .build()
```

By default, all posts will be created with DRAFT status. However, you can explicitly apply the published state to create posts with PUBLISHED status.

```ts
await PostFactory.apply('published').createMany(3)
await PostFactory.createMany(3)
```

## Relationships

Model factories makes it super simple to work with relationships. Consider the following example:

```ts
export const PostFactory = defineFactory<Partial<Post>>(({ faker }) => ({
    tableName: 'post',
    fields: {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(4),
      status: 'DRAFT',
    }
  }))
  .state('published', (attributes) => ({
    status: 'PUBLISHED', // 👈
  }))
  .build()

export const UserFactory = defineFactory<Partial<User>>(({ faker }) => ({
    tableName: 'user',
    fields: {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
  }))
  .hasMany('posts', { foreignKey: 'user_id', localKey: 'id', factory: PostFactory }) // 👈
  .build()
```

Now, you can create a `user` and its `posts` all together in one call.

```ts
const user = await UserFactory.with('posts', 3).create()
user.posts.length // 3
```

### Applying relationship states

You can also apply states on a relationship by passing a callback to the with method.

```ts
const user = await UserFactory
  .with('posts', 3, (post) => post.apply('published'))
  .create()
```

Similarly, if you want, you can create few posts with the published state and few without it.

```ts
const user = await UserFactory
  .with('posts', 3, (post) => post.apply('published'))
  .with('posts', 2)
  .create()

user.posts.length // 5
```

Finally, you can also create nested relationships. For example: Create a user with two posts and five comments for each post.

```ts
const user = await UserFactory
  .with('posts', 2, (post) => post.with('comments', 5))
  .create()
```

The followings are the available relationships:
- `hasOne`
- `hasMany`
- `belongsTo` ( 🚧 coming soon )
- `belongsToMany` ( 🚧 coming soon )
- `manyToMany` ( 🚧 coming soon )
