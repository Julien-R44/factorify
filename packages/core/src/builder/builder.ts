import { faker } from '@faker-js/faker'
import defu from 'defu'
import { factorioConfig } from '../config'
import { convertCase } from '../utils'
import { RelationshipBuilder } from './relationship_builder'
import { StatesManager } from './states_manager'
import type { FactoryModel } from '../model'
import type { FactoryExtractGeneric, WithCallback } from '../contracts'
import type { Knex } from 'knex'

export class Builder<
  Factory extends FactoryModel<any, any>,
  Model extends Record<string, any> = FactoryExtractGeneric<Factory, 'model'>,
  States = FactoryExtractGeneric<Factory, 'states'>,
  Relationships = FactoryExtractGeneric<Factory, 'relationships'>
> {
  private relationshipBuilder: RelationshipBuilder
  private statesManager: StatesManager<States>

  constructor(private factory: Factory) {
    this.relationshipBuilder = new RelationshipBuilder(factory)
    this.statesManager = new StatesManager(factory)
  }

  /**
   * If the builder is at its initial state
   */
  // @ts-expect-error isReset is used in reset method.
  // Take a look at the RelationshipMeta contract for more details about why.
  private isReset = true

  /**
   * The attributes that will be merged for the next created models.
   */
  private mergeInput: Partial<Model> | Partial<Model>[] = []

  /**
   * Ensure a knex connection is alive
   */
  private ensureFactoryConnectionIsSet(knex: Knex | null): knex is Knex {
    if (knex) return true
    throw new Error('You must set a connection to the database before using the factory')
  }

  /**
   * Get the merge attributes for the given index.
   */
  public getMergeAttributes(index: number) {
    if (Array.isArray(this.mergeInput)) {
      return this.mergeInput[index] || {}
    }

    return this.mergeInput
  }

  /**
   * Merge custom attributes on final rows
   */
  private mergeAttributes(rows: Record<string, any>[]) {
    if (Array.isArray(this.mergeInput)) {
      return rows.map((row, index) => defu(this.getMergeAttributes(index), row))
    }

    return rows.map((row) => defu(this.mergeInput, row))
  }

  /**
   * Unwrap factory fields that are functions.
   */
  private async unwrapComputedFields(rows: Record<string, any>[]) {
    const unwrappings = rows.map(async (row) => {
      const unwrappedRow: Record<string, any> = {}

      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'function') {
          const fn = row[key]
          const result = await fn()

          unwrappedRow[key] = result?.id || result
        } else {
          unwrappedRow[key] = value
        }
      }

      return unwrappedRow
    })

    return Promise.all(unwrappings)
  }

  /**
   * Reset the builder to its initial state.
   */
  private reset() {
    this.isReset = true
    this.mergeInput = []
    this.statesManager.reset()
    this.relationshipBuilder.reset()

    Object.values(this.factory.relations).forEach((relation) => {
      const factory = relation.factory()
      if (factory.isReset === false) factory.reset()
    })
  }

  /**
   * Store a merge data that will be used when creating a new model.
   */
  public merge(data: Partial<Model> | Partial<Model>[]) {
    this.mergeInput = data
    return this
  }

  /**
   * Apply a registered state
   */
  public apply(state: States) {
    this.statesManager.register(state)
    return this
  }

  /**
   * Apply a relationship
   */
  public with(name: Relationships, callback?: WithCallback): this
  public with(name: Relationships, count: number, callback?: WithCallback): this
  public with(
    name: Relationships,
    countOrCallback?: number | WithCallback,
    callback?: WithCallback
  ) {
    if (typeof countOrCallback === 'function') {
      this.relationshipBuilder.apply(name as string, 1, countOrCallback)
    } else {
      this.relationshipBuilder.apply(name as string, countOrCallback || 1, callback)
    }
    return this
  }

  /**
   * Create the models. Either by persisting them to the database or
   * by returning them as a plain object.
   */
  private async instantiateModels(count: number, stubbed: boolean) {
    this.isReset = false
    let models: Record<string, any>[] = []

    /**
     * Generate fields for each row by calling the factory callback
     */
    models = Array.from({ length: count }).map(() =>
      this.factory.callback({ faker, isStubbed: false })
    )

    /**
     * Apply merge attributes
     */
    models = this.mergeAttributes(models)

    /**
     * Apply the states
     */
    models = this.statesManager.applyStates(models)

    /**
     * Unwrap computed fields by calling their callbacks
     */
    models = await this.unwrapComputedFields(models)

    /**
     * We now create the belongsTo relationships
     */
    await this.relationshipBuilder.createPre(models, stubbed)

    /**
     * Insert rows
     */
    let result: Record<string, any>[] = []

    if (!stubbed) {
      result = await factorioConfig
        .knex!.insert(convertCase(models, factorioConfig.casing.insert))
        .into(this.factory.tableName)
        .returning('*')
    } else {
      result = models
    }

    /**
     * Create post relationships
     */
    await this.relationshipBuilder.createPost(result, stubbed)

    /**
     * Hydrate pre relationships into the result
     */
    const finalModels = this.relationshipBuilder.postHydrate(result)

    this.reset()

    return finalModels.map((model) => convertCase(model, factorioConfig.casing.return)) as Model[]
  }

  /**
   * Create a model without persisting it to the database.
   */
  public async make(): Promise<Model> {
    const res = await this.makeMany(1)
    return res[0]!
  }

  /**
   * Create models without persisting them to the database.
   */
  public async makeMany(count: number): Promise<Model[]> {
    return this.instantiateModels(count, true)
  }

  /**
   * Create a new model and persist it to the database.
   */
  public async create(): Promise<Model> {
    this.ensureFactoryConnectionIsSet(factorioConfig.knex)
    const res = await this.createMany(1)
    return res[0]!
  }

  /**
   * Create multiple models and persist them to the database.
   */
  public async createMany(count: number): Promise<Model[]> {
    this.ensureFactoryConnectionIsSet(factorioConfig.knex)
    return this.instantiateModels(count, false)
  }
}
