import type { DossierStateKeys } from '@biblio-num/shared'

export type DossierStateValue = {
  label: string,
  type: string;
}

export const DossierState: Record<DossierStateKeys, DossierStateValue> = {
  en_construction: {
    label: 'En construction',
    type: 'new',
  },
  en_instruction: {
    label: 'En instruction',
    type: 'info',
  },
  accepte: {
    label: 'Accepté',
    type: 'success',
  },
  refuse: {
    label: 'Refusé',
    type: 'error',
  },
  sans_suite: {
    label: 'Sans suite',
    type: 'warning',
  },
} as const

export const stateToFr = (dossierStateKey: DossierStateKeys): DossierStateValue => DossierState[dossierStateKey]
