/* eslint-disable sonarjs/no-duplicate-string */
import { test } from '@japa/runner'
import { defineFactory } from '@julr/factorio'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { AccountFactory, UserFactory as BaseUserFactory } from '../tests-helpers/setup.js'
import { setupDb } from '../tests-helpers/db.js'

const UserFactory = defineFactory<any>('user', ({ faker }) => ({
  email: faker.internet.email(),
  password: faker.random.alphaNumeric(6),
})).build()

test.group('factorio', (group) => {
  group.setup(() => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('create one entity', async ({ database }) => {
    await UserFactory.create()
    await database.assertCount('user', 1)
  })

  test('create many entities', async ({ database }) => {
    await UserFactory.createMany(10)
    await database.assertCount('user', 10)
  })

  test('merge with one entity', async ({ database }) => {
    await UserFactory.merge({ email: 'bonjour@ok.com' }).create()
    await database.assertHas('user', { email: 'bonjour@ok.com' })
  })

  test('merge many entities', async ({ expect, database }) => {
    const users = await UserFactory.merge({ email: 'bonjour' }).createMany(10)
    for (const user of users) expect(user.email).toBe('bonjour')
    await database.assertCount('user', 10)
  })

  test('merge many entities with sequence', async ({ database }) => {
    await UserFactory.merge([
      { email: 'first@ok.com' },
      { email: 'second@ok.com' },
      { email: 'third@ok.com' },
    ]).createMany(3)

    await database.assertHas('user', { email: 'first@ok.com' })
    await database.assertHas('user', { email: 'second@ok.com' })
    await database.assertHas('user', { email: 'third@ok.com' })
  })

  test('createMany should return keys camelized', async ({ expect }) => {
    const users = await UserFactory.merge([
      { email: 'first@ok.com' },
      { email: 'second@ok.com' },
      { email: 'third@ok.com' },
    ]).createMany(3)

    expect(users.length).toBe(3)

    for (const user of users) {
      expect(Object.keys(user)).toEqual(expect.arrayContaining(['id', 'email', 'password']))
    }
  })

  test('create entity with nested inline relationship', async ({ expect, database }) => {
    const userFactory = defineFactory('user', ({ faker }) => ({
      email: faker.internet.email(),
      password: faker.random.alphaNumeric(6),
    })).build()

    const postFactory = defineFactory('post', ({ faker }) => ({
      title: faker.company.bs(),
      userId: () => userFactory.create(),
    })).build()

    const post = await postFactory.create()

    expect(post.userId).toBeTruthy()
    await database.assertCount('user', 1)
    await database.assertCount('post', 1)
  })

  test('factory with state', async ({ database }) => {
    const userFactory = defineFactory<any>('user', ({ faker }) => ({
      email: 'bonjour',
      password: faker.random.alphaNumeric(6),
    }))
      .state('businessUser', (attributes) => ({
        email: 'business@admin.com',
        password: attributes.email,
      }))
      .state('admin', () => ({
        email: 'admin@admin.admin',
        password: 'topsecret',
      }))
      .build()

    await userFactory.apply('businessUser').create()
    await database.assertHas('user', { email: 'business@admin.com', password: 'bonjour' })

    await userFactory.apply('admin').create()
    await database.assertHas('user', { email: 'admin@admin.admin', password: 'topsecret' })
  })

  test('cross reference', async ({ database }) => {
    const account = await AccountFactory.with('user').create()

    await database.assertHas('user', { id: account.userId })
    await database.assertHas('account', { id: account.id })

    const user = await BaseUserFactory.with('account').create()

    await database.assertHas('user', { id: user.id })
    await database.assertHas('account', { id: user.account.id })

    await database.assertCount('user', 2)
    await database.assertCount('account', 2)
  })
})
