import { faker } from '@faker-js/faker'
import defu from 'defu'
import humps from 'humps'
import { factorioConfig } from './config'
import type { FactoryModel } from './index'
import type { FactoryExtractGeneric } from './contracts'
import type { Knex } from 'knex'

const { camelizeKeys, decamelizeKeys } = humps

export class Builder<
  Factory extends FactoryModel<any, any>,
  Model extends Record<string, any> = FactoryExtractGeneric<Factory, 'model'>,
  States = FactoryExtractGeneric<Factory, 'states'>
> {
  constructor(private factory: Factory) {}

  /**
   * The attributes that will be merged for the next created models.
   */
  private mergeInput: Partial<Model> | Partial<Model>[] = []

  /**
   * States to apply.
   */
  private appliedStates: Set<States> = new Set()

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
  private getMergeAttributes(index: number) {
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
   * Apply pending states on each row
   */
  private applyStates(rows: Record<string, any>[]) {
    const states = Array.from(this.appliedStates)

    for (const state of states) {
      if (typeof state !== 'string') {
        throw new TypeError('You must provide a state name to apply')
      }

      const stateCallback = this.factory.states[state]

      if (!stateCallback) {
        throw new Error(`The state "${state}" does not exist on the factory`)
      }

      rows = rows.map((row) => defu(stateCallback(row), row))
    }

    return rows
  }

  /**
   * Unwrap factory fields that are functions.
   */
  private async unwrapComputedFields(rows: Record<string, any>[]) {
    for (const row of rows) {
      for (const key in row) {
        if (typeof row[key] === 'function') {
          const fn = row[key]
          const result = await fn()

          row[key] = result?.id || result
        }
      }
    }
  }

  /**
   * Reset the builder to its initial state.
   */
  private resetBuilder() {
    this.mergeInput = []
    this.appliedStates = new Set()
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
    this.appliedStates.add(state)
    return this
  }

  /**
   * Create multiple models and persist them to the database.
   */
  public async createMany(count: number): Promise<Model[]> {
    this.ensureFactoryConnectionIsSet(factorioConfig.knex)

    let rows: Record<string, any>[] = []
    const { tableName } = this.factory.callback({ faker })

    for (let i = 0; i < count; i++) {
      rows.push(this.factory.callback({ faker }).fields)
    }

    rows = this.mergeAttributes(rows)
    rows = this.applyStates(rows)
    await this.unwrapComputedFields(rows)

    const res = await factorioConfig
      .knex!.insert(decamelizeKeys(rows))
      .into(tableName)
      .returning('*')

    this.resetBuilder()

    return res.map((row) => camelizeKeys(row)) as Model[]
  }
}
