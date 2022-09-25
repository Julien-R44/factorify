# Using Factories

Once your factory is defined, your database is configured, you can start using your factories.

```ts
import { UserFactory } from './my-factory.js'

const user = await UserFactory.create()
const users = await UserFactory.createMany(10)
```

Note that the `create` and `createMany` methods are asynchronous. This is because they are using the database to create the records.

Also note that the `create` and `createMany` methods are returning the created records. This is useful if you want to use the created records in your tests.

## Merge attributes

You can override the default set of attributes using the .merge method. For example:

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

## Applying states

For applying a defined state, you can use the `.apply` method. For example:

```ts
await PostFactory.apply('published').createMany(3)
await PostFactory.createMany(3)
```

## Relationships

Make sur to define your relationship on your factories. See [Defining Factories](./defining-factories.md#relationships) for more information.

Once done, you can use the `.with` method to create a model with its relationships. For example:

```ts
const userWithPost = await UserFactory.with('posts', 3).create()

console.log(user.posts.length) // 3
console.log(user.posts[0].userId === user.id) // true
```

### States and merge on relationships

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

## Stubbing models

In some cases, you may prefer to stub out the database calls and just want to create in-memory model instances. This is can achieved using the `make` and `makeMany` methods.

```ts
const user = await UserFactory
  .with('posts', 2)
  .make()

console.log(user.id)
```

The `make` calls will never hit the database and will assign an in-memory numeric id to the model instances.
