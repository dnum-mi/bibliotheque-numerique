import type { DossierStatusBadgeTypeType } from '@/shared/types/DossierStatusBadgeType.type.ts'
import type { DossierStateKeys } from '@biblio-num/shared'

export const dossierStatusDictionary = {
  accepte: { label: 'Accepté', type: 'success' },
  en_construction: { label: 'En construction', type: 'purple-glycine' },
  en_instruction: { label: 'En instruction', type: 'new' },
  refuse: { label: 'Refusé', type: 'error' },
  sans_suite: { label: 'Sans suite', type: 'warning' },
} as const satisfies Record<DossierStateKeys, { label: string; type: DossierStatusBadgeTypeType }>
