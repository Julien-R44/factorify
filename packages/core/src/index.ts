import { Builder } from './builder'
import { defineFactorioConfig } from './config'
import type { DefineFactoryCallback, DefineStateCallback } from './contracts'

export { defineFactorioConfig }

export class FactoryModel<Model extends Record<string, any>, States extends string | null = null> {
  /**
   * Store the factory callback
   */
  public callback: DefineFactoryCallback<Model>

  /**
   * Store each state callbacks
   */
  public states: Record<string, DefineStateCallback<Model>> = {}

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
   * Returns the Builder
   */
  public build(): Builder<typeof this> {
    return new Builder(this)
  }
}

export function defineFactory<T extends Record<string, any>>(cb: DefineFactoryCallback<T>) {
  return new FactoryModel<T>(cb)
}
