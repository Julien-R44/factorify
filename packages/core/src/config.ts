import knex from 'knex'
import { faker } from '@faker-js/faker'
import type { UsableLocale } from '@faker-js/faker'
import type { Knex } from 'knex'
import type { FactorioConfig } from './contracts'

/**
 * Global configuration
 */
export const factorioConfig = {
  knex: null as Knex | null,
}

/**
 * Define the Factorio configuration.
 *
 * Returns a function that can be used to clean up the connection.
 */
export const defineFactorioConfig = (options: FactorioConfig & { locale?: UsableLocale }) => {
  faker.locale = options.locale || faker.locale

  factorioConfig.knex = knex(options.database)

  return () => {
    if (factorioConfig.knex) {
      factorioConfig.knex.destroy()
    }
  }
}
