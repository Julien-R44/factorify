import humps from 'humps'
import type { CasingStrategy } from './contracts.js'

export function convertCase(obj: Record<string, any>, casing: CasingStrategy) {
  if (casing === 'camel') {
    return humps.camelizeKeys(obj)
  }

  if (casing === 'snake') {
    return humps.decamelizeKeys(obj)
  }

  return obj
}
