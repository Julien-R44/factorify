import defu from 'defu'
import type { FactoryModel } from '../model'

export class StatesManager<States> {
  constructor(private factory: FactoryModel<any, any>) {}

  /**
   * Registered states that need to be applied on the
   * next created models.
   */
  private registeredStates: Set<States> = new Set()

  /**
   * Get the callback for the given state.
   */
  getStateCallback(state: States) {
    if (typeof state !== 'string') {
      throw new TypeError('You must provide a state name to apply')
    }

    const stateCallback = this.factory.states[state]
    if (!stateCallback) {
      throw new Error(`The state "${state}" does not exist on the factory`)
    }

    return stateCallback
  }

  /**
   * Apply the registered states on the given rows.
   */
  public applyStates(rows: Record<string, any>[]) {
    const states = Array.from(this.registeredStates)

    for (const state of states) {
      const stateCallback = this.getStateCallback(state)
      rows = rows.map((row) => defu(stateCallback(row), row))
    }

    return rows
  }

  /**
   * Register a state to be applied on the next created models.
   */
  public register(state: States) {
    this.registeredStates.add(state)
  }

  /**
   * Unregister all states.
   */
  public reset() {
    this.registeredStates = new Set()
  }
}
