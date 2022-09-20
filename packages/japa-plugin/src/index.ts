import { defineFactorioConfig } from '@julr/factorio'
import type { PluginFn } from '@japa/runner'

export function factorio(options: Parameters<typeof defineFactorioConfig>[0]): PluginFn {
  const disconnect = defineFactorioConfig(options)

  return async function (config) {
    config.teardown.push(disconnect)
  }
}
