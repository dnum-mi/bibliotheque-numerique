import type {
  DependencyName,
  iDependencyCheckResult,
} from '@biblio-num/shared'

/**
 * Contrat commun pour une dépendance.
 * - check() : exécute un test rapide (timeout court, sans effets de bord)
 * - isReady() : optionnel, si on peut lire un état local (ex: redisClient.status)
 */
export interface DependencyChecker {
  readonly name: DependencyName;
  check(): Promise<iDependencyCheckResult>;
  isReady?(): boolean;
}

/**
 * Configuration de criticité "par application".
 * Ce n'est PAS encodé dans la dépendance elle-même.
 */
export type DependencyPolicy = Partial<Record<DependencyName, { critical: boolean }>>
