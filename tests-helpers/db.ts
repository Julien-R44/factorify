import knex from 'knex'
import type { Knex } from 'knex'

const credentials = {
  host: 'localhost',
  user: 'japa',
  password: 'password',
  database: 'japa',
}

const connectionConfigMap: { [key: string]: Knex.Config } = {
  better_sqlite: { client: 'better-sqlite3', connection: { filename: 'test' } },
  sqlite: { client: 'sqlite', connection: { filename: 'test' } },
  mysql: { client: 'mysql2', connection: { ...credentials, port: 3306 } },
  postgres: { client: 'pg', connection: { ...credentials, port: 5432 } },
  mssql: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      database: 'master',
      user: 'sa',
      password: 'arandom&233password',
      port: 1433,
    },
  },
}

export const connectionConfig = connectionConfigMap[process.env.DB || 'better_sqlite']!

export const connection = knex(connectionConfig)

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
