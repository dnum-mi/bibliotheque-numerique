import type { DependencyName } from '@biblio-num/shared'

export const healthDependenciesDictionary: Record<DependencyName, string> = {
  's3': 'La consultation des pièces jointes est temporairement indisponible',
  'hub': 'La recherche et la consultation des organismes est temporairement indisponible',
  'ds': 'La récupération des données depuis démarche numérique est temporairement indisponible',
  'redis': 'La récupération des données depuis démarche numérique est temporairement indisponible',
}
