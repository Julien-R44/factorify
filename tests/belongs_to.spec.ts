import { test } from '@japa/runner'
import { DatabaseUtils } from '@julr/japa-database-plugin'
import { AccountFactory } from '../tests-helpers/setup.js'
import { setupDb } from '../tests-helpers/db.js'

test.group('BelongsTo', (group) => {
  group.setup(async () => setupDb())
  group.each.setup(() => DatabaseUtils.refreshDatabase())

  test('Basic', async ({ database, expect }) => {
    const account = await AccountFactory.with('user').create()

    expect(account.userId).toBeDefined()
    expect(account.user).toBeDefined()
    expect(account.user.id).toBeDefined()
    expect(account.user.id).toStrictEqual(account.userId)

    await database.assertHas('account', { user_id: account.user.id }, 1)
    await database.assertHas('user', { id: account.userId }, 1)
  })

  test('Basic stubbed', async ({ database, expect }) => {
    const account = await AccountFactory.with('user').make()

    expect(account.userId).toBeDefined()
    expect(account.user).toBeDefined()
    expect(account.user.id).toBeDefined()
    expect(account.user.id).toStrictEqual(account.userId)

    await database.assertCount('account', 0)
    await database.assertCount('user', 0)
  })

  test('createMany', async ({ database }) => {
    const [accountA, accountB] = await AccountFactory.with('user').createMany(2)

    await Promise.all([
      await database.assertCount('user', 2),
      await database.assertCount('account', 2),

      await database.assertHas('account', { user_id: accountA!.user.id }, 1),
      await database.assertHas('account', { user_id: accountB!.user.id }, 1),

      await database.assertHas('user', { id: accountA!.user.id }, 1),
      await database.assertHas('user', { id: accountB!.user.id }, 1),
    ])
  })

  test('createMany stubbed', async ({ database, expect }) => {
    const [accountA, accountB] = await AccountFactory.with('user').makeMany(2)

    await database.assertCount('user', 0)
    await database.assertCount('account', 0)

    expect(accountA!.userId).toBeDefined()
    expect(accountB!.userId).toBeDefined()

    expect(accountA!.user.id).toEqual(accountA!.userId)
    expect(accountB!.user.id).toEqual(accountB!.userId)
  })

  test('Chaining with', async ({ database }) => {
    const account = await AccountFactory.with('user').with('admin').create()

    await Promise.all([
      database.assertCount('user', 1),
      database.assertCount('admin', 1),
      database.assertCount('account', 1),

      database.assertHas('account', { user_id: account.user.id }, 1),
      database.assertHas('account', { admin_id: account.admin.id }, 1),
      database.assertHas('user', { id: account.user.id }, 1),
      database.assertHas('admin', { id: account.admin.id }, 1),
    ])
  })

  test('Chaining with - callback', async ({ database }) => {
    const account = await AccountFactory.with('user', 1, (user) => user.merge({ email: 'bonjour' }))
      .with('admin', 1, (admin) => admin.merge({ email: 'admin' }))
      .create()

    await Promise.all([
      database.assertHas('user', { email: 'bonjour' }, 1),
      database.assertHas('admin', { email: 'admin' }, 1),
      database.assertHas('account', { user_id: account.user.id, admin_id: account.admin.id }, 1),
    ])
  })

  test('With - state', async ({ database }) => {
    const account = await AccountFactory.with('user', 1, (user) =>
      user.apply('easyPassword').apply('easyEmail')
    ).create()

    await Promise.all([
      database.assertHas('user', { password: 'easy', email: 'easy@easy.com' }),
      database.assertHas('account', { user_id: account.user.id }, 1),
    ])
  })
})
