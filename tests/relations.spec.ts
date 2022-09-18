import { test } from '@japa/runner'
import { defineFactory } from '@julr/factorio'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { setupDb } from '../tests-helpers/db.js'

/**
 * Factory definitions
 */
const profileFactory = defineFactory(({ faker }) => ({
  tableName: 'profile',
  fields: {
    age: faker.datatype.number(),
    email: faker.internet.email(),
  },
})).build()

const postFactory = defineFactory(({ faker }) => ({
  tableName: 'post',
  fields: {
    title: faker.lorem.sentence(),
  },
})).build()

const userFactory = defineFactory<any>(({ faker }) => ({
  tableName: 'user',
  fields: {
    id: faker.datatype.number(),
  },
}))
  .hasOne('profile', { foreignKey: 'user_id', localKey: 'id', factory: profileFactory })
  .hasMany('posts', { foreignKey: 'user_id', localKey: 'id', factory: postFactory })
  .build()

/**
 * Tests HasOne
 */
test.group('HasOne', (group) => {
  group.setup(async () => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('Basic', async ({ database }) => {
    const user = await userFactory.with('profile').create()

    await database.assertCount('user', 1)
    await database.assertCount('profile', 1)

    await database.assertHas('profile', { user_id: user.id }, 1)
  })

  test('Has one - createMany', async ({ database }) => {
    await database.assertCount('user', 0)
    await database.assertCount('profile', 0)

    const users = await userFactory.with('profile').createMany(2)

    await database.assertCount('user', 2)
    await database.assertCount('profile', 2)

    await database.assertHas('profile', { user_id: users[0].id }, 1)
    await database.assertHas('profile', { user_id: users[1].id }, 1)
  })

  test('Has one - returns relationship', async ({ expect }) => {
    const user = await userFactory.with('profile').create()

    expect(user.profile).toBeDefined()
    expect(user.profile.age).toBeDefined()
  })

  test('Has one - returns relationship - createMany', async ({ expect }) => {
    const users = await userFactory.with('profile').createMany(2)

    expect(users[0].profile).toBeDefined()
    expect(users[0].profile.age).toBeDefined()
    expect(users[0].id).toStrictEqual(users[0].profile.userId)

    expect(users[1].profile).toBeDefined()
    expect(users[1].profile.age).toBeDefined()
    expect(users[1].id).toStrictEqual(users[1].profile.userId)
  })
})

/**
 * Tests HasMany
 */
test.group('HasMany', (group) => {
  group.setup(async () => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('Basic', async ({ database }) => {
    const user = await userFactory.with('posts').create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 1)

    await database.assertHas('post', { user_id: user.id }, 1)
  })

  test('With many', async ({ database }) => {
    const user = await userFactory.with('posts', 2).create()

    await database.assertCount('user', 1)
    await database.assertCount('post', 2)

    await database.assertHas('post', { user_id: user.id }, 2)
  })

  test('Should returns as array', async ({ expect }) => {
    const user = await userFactory.with('posts', 2).create()

    expect(user.posts).toBeInstanceOf(Array)
    expect(user.posts.length).toStrictEqual(2)
  })

  test('Create many', async ({ expect, database }) => {
    const users = await userFactory.with('posts', 2).createMany(2)

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
})
