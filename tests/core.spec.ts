/* eslint-disable sonarjs/no-duplicate-string */
import { test } from '@japa/runner'
import { defineFactory } from '@julr/factorio'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { setupDb } from '../tests-helpers/db.js'

interface User {
  [key: string]: any
}

const UserFactory = defineFactory<Partial<User>>(({ faker }) => ({
  tableName: 'user',
  fields: { email: faker.internet.email(), referralCode: faker.random.alphaNumeric(6) },
})).build()

test.group('factorio', (group) => {
  group.setup(async () => {
    await setupDb()
  })

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
    const users = await UserFactory.merge({ onboardingStep: 'bonjour' }).createMany(10)
    for (const user of users) expect(user.onboardingStep).toBe('bonjour')
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
      expect(Object.keys(user)).toEqual(expect.arrayContaining(['id', 'email', 'referralCode']))
    }
  })

  test('create entity with nested inline relationship', async ({ expect, database }) => {
    const userFactory = defineFactory(({ faker }) => ({
      tableName: 'user',
      fields: {
        email: faker.internet.email(),
        referralCode: faker.random.alphaNumeric(6),
      },
    })).build()

    const stableFactory = defineFactory(({ faker }) => ({
      tableName: 'stable',
      fields: {
        name: faker.company.bs(),
        userId: () => userFactory.create(),
      },
    })).build()

    const stable = await stableFactory.create()

    expect(stable.userId).toBeTruthy()
    await database.assertCount('user', 1)
    await database.assertCount('stable', 1)
  })

  test('factory with state', async ({ database }) => {
    const userFactory = defineFactory<Partial<User>>(({ faker }) => ({
      tableName: 'user',
      fields: {
        email: 'bonjour',
        referralCode: faker.random.alphaNumeric(6),
      },
    }))
      .state('businessUser', (attributes) => ({
        isBusinessUser: true,
        stripeId: attributes.email,
      }))
      .state('admin', () => ({
        email: 'admin@admin.admin',
      }))
      .build()

    await userFactory.apply('businessUser').create()
    await database.assertHas('user', { is_business_user: true, stripe_id: 'bonjour' })

    await userFactory.apply('admin').create()
    await database.assertHas('user', { email: 'admin@admin.admin', is_business_user: false })
  })
})
