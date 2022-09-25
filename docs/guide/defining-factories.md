# Defining Factories

A general recomendation is to define your factories in a separate folder. If you applications is quite complex, it is also a good idea to split your factories in multiple files.

Anyway, here is an example of a factory definition:

```ts
import type { User } from './types.js'

const UserFactory = defineFactory<User>('user', ({ faker, isStubbed }) => ({
  email: faker.internet.email(), 
  password: faker.random.alphaNumeric(6),
  computedField: () => {
    // You can also use a function to define a field
    return 'computed value'
  }
}))
  .build()
```

Some things to note here :
- The first parameter must be the table name of your model. 
- We can pass a generic type to the `defineFactory` function. This is useful to get autocompletion on the model attributes.
- Make sure that your factory return an object with all the required properties by your DB, otherwise it will raise not null exceptions.
- Your factory callback is receiving a `faker` object, which is a [Faker.js](https://fakerjs.dev/guide/) instance. You can use it to generate random data.

## States

Factory states allow you to define variations of your factories as states. This is useful when you want have multiple variations of your model that you can re-use in your tests

```ts
const UserFactory = defineFactory<User>('user', ({ faker }) => ({
  email: faker.internet.email(), 
  password: faker.random.alphaNumeric(6),
  role: 'user'
}))
  .state('admin', () => ({ role: 'admin' }))
  .build()
```

Here, by default, all the users created with the `UserFactory` will have the `role` attribute set to `user`. But we can also create an admin user by using the `admin` state:

```ts
const admin = await UserFactory.apply('admin').create()
```

## Relationships

Factorify allows you to define relationships between your models. Let's say that we have a `Post` model that has a `userId` attribute. We can define a relationship between the `User` and `Post` models like this:

```ts
const PostFactory = defineFactory<Post>('post', ({ faker }) => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3)
}))
  .build()

const UserFactory = defineFactory<User>('user', ({ faker }) => ({
  email: faker.internet.email(), 
  password: faker.random.alphaNumeric(6),
  role: 'user'
}))
  .state('admin', () => ({ role: 'admin' }))
  .hasMany('posts', () => PostFactory) // 👈
  .build()
```

Now, you can create a user and its posts all together in one call.

```ts
const user = await UserFactory.with('posts', 3).create()
```

The followings are the available relationships that works the same way:

- `hasOne`
- `hasMany`
- `belongsTo`
- `manyToMany` ( 🚧 coming soon )

### Conventions

Factorify supposes that the foreign key of the relationship is the name of the table in snake case followed by `_id`.

For the above example, Factorify suppose that the `Post` model has a `user_id` attribute. 

Factorify will also suppose that the local key is `id`. 

If you want to override this convention, you can pass a second parameter to the relationship function:

```ts{13-16}
const PostFactory = defineFactory<Post>('post', ({ faker }) => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3)
}))
  .build()

const UserFactory = defineFactory<User>('user', ({ faker }) => ({
  email: faker.internet.email(), 
  password: faker.random.alphaNumeric(6),
  role: 'user'
}))
  .state('admin', () => ({ role: 'admin' }))
  .hasMany('posts', () => PostFactory, { 
    localKey: 'my_local_id',
    foreignKey: 'my_fk_user_id'
  })
  .build()
```

Here, we are saying to Factorify that the local key of User is `my_local_id` and the foreign key of Post is `my_fk_user_id`.

### Inline relationships

You can also create inline relationships. This allow you to always create a associated model when you create the parent model.

```ts
const UserFactory = defineFactory<User>('user', ({ faker }) => ({
  email: faker.internet.email(), 
  password: faker.random.alphaNumeric(6),
})).build()

const AccountFactory = defineFactory<Account>('account', ({ faker }) => ({
  name: faker.company.companyName(),
  userId: () => UserFactory.create()
})).build()
```

When you create an account, it will also create a user that will be associated to the account.
