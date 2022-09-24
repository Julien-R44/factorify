import { defineFactorifyConfig } from '@julr/factorify'
import type { PluginFn } from '@japa/runner'

export function factorify(options: Parameters<typeof defineFactorifyConfig>[0]): PluginFn {
  const disconnect = defineFactorifyConfig(options)

  return async function (config) {
    config.teardown.push(disconnect)
  }
}
