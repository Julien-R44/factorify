import { defineFactorioConfig } from './config'
import { FactoryModel } from './model'
import type { DefineFactoryCallback } from './contracts'

export { defineFactorioConfig }

/**
 * Define a new factory.
 */
export function defineFactory<T extends Record<string, any>>(cb: DefineFactoryCallback<T>) {
  return new FactoryModel<T>(cb) as Omit<FactoryModel<T>, 'callback' | 'states' | 'relations'>
}
