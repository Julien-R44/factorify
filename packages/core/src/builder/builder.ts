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
  States = FactoryExtractGeneric<Factory, 'states'>
> {
  private relationshipBuilder: RelationshipBuilder
  private statesManager: StatesManager<States>

  constructor(private factory: Factory) {
    this.relationshipBuilder = new RelationshipBuilder(factory)
    this.statesManager = new StatesManager(factory)
  }

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
  private resetBuilder() {
    this.mergeInput = []
    this.statesManager.reset()
    this.relationshipBuilder.reset()

    Object.values(this.factory.relations).forEach((relation) => relation.factory().resetBuilder())
  }

  /**
   * Store a merge data that will be used when creating a new model.
   */
  public merge(data: Partial<Model> | Partial<Model>[]) {
    this.mergeInput = data
    return this
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
   * Apply a registered state
   */
  public apply(state: States) {
    this.statesManager.register(state)
    return this
  }

  /**
   * Apply a relationship
   */
  public with(name: string, count = 1, callback?: WithCallback) {
    this.relationshipBuilder.apply(name, count, callback)
    return this
  }

  /**
   * Create multiple models and persist them to the database.
   */
  public async createMany(count: number): Promise<Model[]> {
    this.ensureFactoryConnectionIsSet(factorioConfig.knex)
    let models: Record<string, any>[] = []

    /**
     * Generate fields for each row by calling the factory callback
     */
    models = Array.from({ length: count }).map(() => this.factory.callback({ faker }))

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
    await this.relationshipBuilder.createPre(models)

    /**
     * Insert rows
     */
    const res = await factorioConfig
      .knex!.insert(convertCase(models, factorioConfig.casing.insert))
      .into(this.factory.tableName)
      .returning('*')

    /**
     * Create post relationships
     */
    await this.relationshipBuilder.createPost(res)

    /**
     * Hydrate pre relationships into the result
     */
    const finalModels = this.relationshipBuilder.postHydrate(res)

    this.resetBuilder()

    return finalModels.map((model) => convertCase(model, factorioConfig.casing.return)) as Model[]
  }
}
