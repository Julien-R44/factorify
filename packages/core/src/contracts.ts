import type { Builder } from './builder/builder'
import type { FactoryModel } from './model'
import type { faker } from '@faker-js/faker'
import type { Knex } from 'knex'

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

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

/**
 * Possible relations type
 */
export enum RelationType {
  HasOne = 'has-one',
  HasMany = 'has-many',
  BelongsTo = 'belongs-to',
}

/**
 * Metadata for a relationship.
 */
export interface RelationshipMeta {
  type: RelationType

  /**
   * If no localKey is defined, we gonna assume that it's "id"
   */
  localKey: string

  /**
   * If no foreignKey is defined, we gonna assume that it's "{tableName}_id"
   */
  foreignKey: string

  /**
   * Reference to the relation factory
   */
  factory: Builder<any, any, any>
}

export type RelationshipMetaOptions = Optional<
  Omit<RelationshipMeta, 'type'>,
  'foreignKey' | 'localKey'
>
