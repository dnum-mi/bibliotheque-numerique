export type DependencyName = 'redis' | 'ds' | 'hub' | 's3'

export type DependencyStatus = 'up' | 'down'

export interface DependencyCheckResult {
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

/**
 * Contrat commun pour une dépendance.
 * - check() : exécute un test rapide (timeout court, sans effets de bord)
 * - isReady() : optionnel, si on peut lire un état local (ex: redisClient.status)
 */
export interface DependencyChecker {
  readonly name: DependencyName
  check(): Promise<DependencyCheckResult>
  isReady?(): boolean
}

/**
 * Configuration de criticité "par application".
 * Ce n'est PAS encodé dans la dépendance elle-même.
 */
export type DependencyPolicy = Partial<Record<DependencyName, { critical: boolean }>>
