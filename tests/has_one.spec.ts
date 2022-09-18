import { test } from '@japa/runner'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { UserFactory } from '../tests-helpers/setup.js'
import { setupDb } from '../tests-helpers/db.js'

test.group('HasOne', (group) => {
  group.setup(async () => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('Basic', async ({ database }) => {
    const user = await UserFactory.with('profile').create()

    await database.assertCount('user', 1)
    await database.assertCount('profile', 1)

    await database.assertHas('profile', { user_id: user.id }, 1)
  })

  test('createMany', async ({ database }) => {
    await database.assertCount('user', 0)
    await database.assertCount('profile', 0)

    const users = await UserFactory.with('profile').createMany(2)

    await database.assertCount('user', 2)
    await database.assertCount('profile', 2)

    await database.assertHas('profile', { user_id: users[0].id }, 1)
    await database.assertHas('profile', { user_id: users[1].id }, 1)
  })

  test('returns relationship', async ({ expect }) => {
    const user = await UserFactory.with('profile').create()

    expect(user.profile).toBeDefined()
    expect(user.profile.age).toBeDefined()
  })

  test('returns relationship - createMany', async ({ expect }) => {
    const users = await UserFactory.with('profile').createMany(2)

    expect(users[0].profile).toBeDefined()
    expect(users[0].profile.age).toBeDefined()
    expect(users[0].id).toStrictEqual(users[0].profile.userId)

    expect(users[1].profile).toBeDefined()
    expect(users[1].profile.age).toBeDefined()
    expect(users[1].id).toStrictEqual(users[1].profile.userId)
  })

  test('Chaining with', async ({ database }) => {
    const user = await UserFactory.with('profile').with('profile').create()

    await database.assertCount('user', 1)
    await database.assertCount('profile', 2)

    await database.assertHas('profile', { user_id: user.id }, 2)
  })

  test('Chaining with - callback', async ({ database }) => {
    const user = await UserFactory.with('profile', 1, (profile) => profile.merge({ age: 20 }))
      .with('profile', 1, (profile) => profile.merge({ age: 30 }))
      .create()

    await database.assertCount('user', 1)
    await database.assertCount('profile', 2)

    await database.assertHas('profile', { user_id: user.id, age: 20 }, 1)
    await database.assertHas('profile', { user_id: user.id, age: 30 }, 1)
  })

  test('With - state', async ({ database }) => {
    const user = await UserFactory.with('profile', 1, (profile) =>
      profile.apply('old').apply('admin')
    ).create()

    await database.assertCount('user', 1)
    await database.assertCount('profile', 1)

    await database.assertHas('profile', { user_id: user.id, age: 150, email: 'admin@admin.com' }, 1)
  })
})
