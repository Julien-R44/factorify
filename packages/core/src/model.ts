import { Builder } from './builder/builder'
import { RelationType } from './contracts'
import type {
  DefineFactoryCallback,
  DefineStateCallback,
  RelationshipMeta,
  RelationshipMetaOptions,
} from './contracts'

export class FactoryModel<
  Model extends Record<string, any>,
  States extends string | null = null,
  Relationships extends string | null = null
> {
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

  /**
   * The SQL table name for the model.
   */
  public tableName: string

  constructor(tableName: string, callback: DefineFactoryCallback<Model>) {
    this.tableName = tableName
    this.callback = callback
  }

  private addRelation(
    name: string,
    factory: RelationshipMeta['factory'],
    type: RelationType,
    meta?: RelationshipMetaOptions
  ) {
    this.relations[name] = {
      foreignKey: `${this.tableName}_id`,
      localKey: 'id',
      factory,
      ...meta,
      type,
    }

    return this
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
  public hasOne<S extends string>(
    name: S,
    cb: RelationshipMeta['factory'],
    meta?: RelationshipMetaOptions
  ): FactoryModel<Model, States, Extract<Relationships | S, string>> {
    return this.addRelation(name, cb, RelationType.HasOne, meta)
  }

  /**
   * Add hasMany relationship
   */
  public hasMany<S extends string>(
    name: S,
    cb: RelationshipMeta['factory'],
    meta?: RelationshipMetaOptions
  ): FactoryModel<Model, States, Extract<Relationships | S, string>> {
    return this.addRelation(name, cb, RelationType.HasMany, meta)
  }

  /**
   * Add belongsTo relationship
   */
  public belongsTo<S extends string>(
    name: S,
    cb: RelationshipMeta['factory'],
    meta?: RelationshipMetaOptions
  ): FactoryModel<Model, States, Extract<Relationships | S, string>> {
    return this.addRelation(name, cb, RelationType.BelongsTo, meta)
  }

  /**
   * Returns the Builder
   */
  public build(): Builder<typeof this> {
    return new Builder(this)
  }
}
