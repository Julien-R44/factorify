import knex from 'knex'

export const connection = knex({
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: './test.sqlite',
  },
})

export const setupDb = async () => {
  await connection.schema.dropTableIfExists('user')
  await connection.schema.dropTableIfExists('stable')

  await connection.schema.createTable('user', (table) => {
    table.integer('id').primary()
    table.string('email')
    table.string('referral_code')
    table.boolean('is_business_user').defaultTo(false)
    table.string('stripe_id')
    table.string('onboarding_step')
  })

  await connection.schema.createTable('stable', (table) => {
    table.integer('id').primary()
    table.string('name')
    table.integer('user_id')
  })
}
