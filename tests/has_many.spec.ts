import { test } from '@japa/runner'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { defineFactory } from '@julr/factorio'
import { UserFactory } from '../tests-helpers/setup.js'
import { setupDb } from '../tests-helpers/db.js'

test.group('HasMany', (group) => {
  group.setup(async () => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('Basic', async ({ database }) => {
    const user = await UserFactory.with('posts').create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 1)

    await database.assertHas('post', { user_id: user.id }, 1)
  })

  test('With many', async ({ database }) => {
    const user = await UserFactory.with('posts', 2).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 2)

    await database.assertHas('post', { user_id: user.id }, 2)
  })

  test('Should returns as array', async ({ expect }) => {
    const user = await UserFactory.with('posts', 2).create()

    expect(user.posts).toBeInstanceOf(Array)
    expect(user.posts.length).toStrictEqual(2)
  })

  test('Create many', async ({ expect, database }) => {
    const users = await UserFactory.with('posts', 2).createMany(2)

    await Promise.all([
      database.assertCount('user', 2),
      database.assertCount('post', 4),
      database.assertHas('post', { user_id: users[0].id }, 2),
      database.assertHas('post', { user_id: users[1].id }, 2),
    ])

    expect(users[0].posts).toBeInstanceOf(Array)
    expect(users[0].posts.length).toStrictEqual(2)

    expect(users[1].posts).toBeInstanceOf(Array)
    expect(users[1].posts.length).toStrictEqual(2)
  })

  test('Chaining', async ({ database }) => {
    const user = await UserFactory.with('posts', 5).with('posts', 5).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 10)

    await database.assertHas('post', { user_id: user.id }, 10)
  })

  test('With- state', async ({ database }) => {
    const user = await UserFactory.with('posts', 10, (post) => post.apply('nodeArticle')).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 10)

    await database.assertHas('post', { user_id: user.id, title: 'NodeJS' }, 10)
  })

  test('With - merge array', async ({ database }) => {
    const user = await UserFactory.with('posts', 10, (post) =>
      post.merge([{ title: 'Rust' }, { title: 'AdonisJS' }])
    ).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 10)

    await database.assertHas('post', { user_id: user.id, title: 'Rust' }, 1)
    await database.assertHas('post', { user_id: user.id, title: 'AdonisJS' }, 1)
  })

  test('auto detect foreign and primary keys', async ({ database }) => {
    const postFactory = defineFactory<any>('post', ({ faker }) => ({
      title: faker.company.bs(),
    })).build()

    const userFactory = defineFactory<any>('user', ({ faker }) => ({
      email: faker.internet.email(),
      password: faker.random.alphaNumeric(6),
    }))
      .hasMany('post', { factory: () => postFactory })
      .build()

    const user = await userFactory.with('post', 5).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 5)
    await database.assertHas('post', { user_id: user.id }, 5)
  })
})
