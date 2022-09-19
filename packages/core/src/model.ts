import { Builder } from './builder/builder'
import type { DefineFactoryCallback, DefineStateCallback } from './contracts'

interface HasOneMeta {
  type: 'has-one' | 'has-many' | 'belongs-to'
  localKey: string
  foreignKey: string
  factory: Builder<any, any, any>
}

type RelationshipMeta = HasOneMeta

export class FactoryModel<Model extends Record<string, any>, States extends string | null = null> {
  /**
   * Store the factory callback
   */
  public callback: DefineFactoryCallback<Model>

  /**
   * Store each state callbacks
   */
  public states: Record<string, DefineStateCallback<Model>> = {}

  /**
   * Store relations metadata
   */
  public relations: Record<string, RelationshipMeta> = {}

  constructor(callback: DefineFactoryCallback<Model>) {
    this.callback = callback
  }

  /**
   * Allows you to define a new state for the factory.
   */
  public state<S extends string>(
    name: S,
    stateCb: DefineStateCallback<Model>
  ): FactoryModel<Model, Extract<States | S, string>> {
    this.states[name] = stateCb
    return this
  }

  /**
   * Add hasOne relationship
   */
  public hasOne(name: string, meta: Omit<HasOneMeta, 'type'>) {
    this.relations[name] = { ...meta, type: 'has-one' }
    return this
  }

  /**
   * Add hasMany relationship
   */
  public hasMany(name: string, meta: Omit<HasOneMeta, 'type'>) {
    this.relations[name] = { ...meta, type: 'has-many' }
    return this
  }

  /**
   * Add belongsTo relationship
   */
  public belongsTo(name: string, meta: Omit<HasOneMeta, 'type'>) {
    this.relations[name] = { ...meta, type: 'belongs-to' }
    return this
  }

  /**
   * Returns the Builder
   */
  public build(): Builder<typeof this> {
    return new Builder(this)
  }
}
