import type { EnvTextKeys } from './environment.type'

export type DependencyName = 'redis' | 'ds' | 'hub' | 's3'
export type DependencyStatus = 'up' | 'down'

export interface iHealthOutput {
  status: 'ok' | 'degraded' | 'down',
  timestamp: Date,
  dependencies: Record<string, {name: string, status: 'ok' | 'down'}>
  info: {
    version: string,
    environment: EnvTextKeys
  }
}
