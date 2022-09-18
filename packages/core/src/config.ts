import knex from 'knex'
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
export const defineFactorioConfig = (options: FactorioConfig) => {
  factorioConfig.knex = knex(options.database)

  return () => {
    if (factorioConfig.knex) {
      factorioConfig.knex.destroy()
    }
  }
}
