import { defineFactorioConfig } from './config'
import { FactoryModel } from './model'
import type { Builder } from './builder/builder'
import type { DefineFactoryCallback } from './contracts'

export { defineFactorioConfig, FactoryModel, Builder }

/**
 * Define a new factory.
 */
export function defineFactory<T extends Record<string, any>>(
  table: string,
  cb: DefineFactoryCallback<T>
) {
  return new FactoryModel<T>(table, cb)
}
