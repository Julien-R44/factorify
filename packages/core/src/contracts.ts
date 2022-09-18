import type { Builder } from './builder.js'
import type { FactoryModel } from './model'
import type { faker } from '@faker-js/faker'
import type { Knex } from 'knex'

/**
 * Callback that must be passed to the `defineFactory` function.
 */
export type DefineFactoryCallback<T> = (args: { faker: typeof faker }) => {
  tableName: string
  fields: {
    [K in keyof T]: T[K] | (() => T[K] | Promise<T[K]>)
  }
}

/**
 * Callback that must be passed to the `state` function.
 */
export type DefineStateCallback<T> = (attributes: T) => Partial<T>

/**
 * The Factorio configuration.
 */
export interface FactorioConfig {
  database: Knex.Config
}

/**
 * Extract generics from FactoryModel class
 */
export type FactoryExtractGeneric<
  Factory extends FactoryModel<any, any>,
  Extracted extends 'states' | 'model'
> = Factory extends FactoryModel<infer Model, infer States>
  ? Extracted extends 'states'
    ? States
    : Model
  : never

/**
 * Callback that must be passed to the `with` function.
 */
export type WithCallback = (builder: Builder<any>) => void
