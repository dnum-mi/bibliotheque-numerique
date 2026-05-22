import type { EnvTextKeys } from './environment.type'

export type DependencyName = 'redis' | 'ds' | 'hub' | 's3'
export type DependencyStatus = 'up' | 'down' | 'degraded'

export interface iDependencyCheckResult {
  name: DependencyName
  status: DependencyStatus

  /**
   * Court et lisible : "Redis not ready", "DS timeout", etc.
   * Destiné aux logs et aux retours health.
   */
  message?: string

  /**
   * Infos additionnelles (latence, endpoint, compteurs, etc.)
   * Doit rester "safe" à exposer (pas de secrets).
   */
  details?: Record<string, unknown>
}


export interface iHealthOutput {
  status: DependencyStatus
  timestamp: Date
  dependenciesHash: Record<DependencyName, iDependencyCheckResult>
  info: {
    version: string
    environment: EnvTextKeys
  }
}
