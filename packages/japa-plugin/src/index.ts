import { defineFactorioConfig } from '@julr/factorio'
import type { Knex } from 'knex'
import type { PluginFn } from '@japa/runner'

export function factorio({ database }: { database: Knex.Config }): PluginFn {
  const disconnect = defineFactorioConfig({ database })

  return async function (config) {
    config.teardown.push(disconnect)
  }
}
