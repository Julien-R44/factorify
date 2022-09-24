import knex from 'knex'
import { faker } from '@faker-js/faker'
import type { UsableLocale } from '@faker-js/faker'
import type { Knex } from 'knex'
import type { FactorifyConfig } from './contracts'

/**
 * Global configuration
 */
export const factorifyConfig = {
  knex: null as Knex | null,
  casing: {
    insert: 'snake',
    return: 'camel',
  } as NonNullable<FactorifyConfig['casing']>,
}

/**
 * Define the Factorify configuration.
 *
 * Returns a function that can be used to clean up the connection.
 */
export const defineFactorifyConfig = (options: FactorifyConfig & { locale?: UsableLocale }) => {
  faker.locale = options.locale || faker.locale

  factorifyConfig.knex = knex(options.database)
  factorifyConfig.casing = options.casing || factorifyConfig.casing

  return () => {
    if (factorifyConfig.knex) {
      factorifyConfig.knex.destroy()
    }
  }
}
