import knex from 'knex'
import type { Knex } from 'knex'

const credentials = {
  host: 'localhost',
  user: 'japa',
  password: 'password',
  database: 'japa',
}

const connectionConfigMap: { [key: string]: Knex.Config } = {
  better_sqlite: { client: 'better-sqlite3', connection: { filename: 'test.sqlite' } },
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
  await connection.schema.dropTableIfExists('profile')
  await connection.schema.dropTableIfExists('post')
  await connection.schema.dropTableIfExists('user')

  await connection.schema.createTable('user', (table) => {
    table.increments('id').primary()
    table.string('email')
    table.string('password')
  })

  await connection.schema.createTable('profile', (table) => {
    table.increments('id').primary()
    table.string('email')
    table.integer('age')
    table.integer('user_id').unsigned()

    table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
  })

  await connection.schema.createTable('post', (table) => {
    table.increments('id').primary()
    table.string('title')
    table.integer('user_id').unsigned()

    table.foreign('user_id').references('id').inTable('user').onDelete('CASCADE')
  })
}
