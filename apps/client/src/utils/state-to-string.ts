import type { DossierStateKeys } from '@biblio-num/shared'

export type DossierStateValue = {
  label: string,
  type: string;
}

export const DossierState: Record<DossierStateKeys, DossierStateValue> = {
  accepte: {
    label: 'Accepté',
    type: 'success',
  },
  en_construction: {
    label: 'En construction',
    type: 'new',
  },
  en_instruction: {
    label: 'En instruction',
    type: 'info',
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

export const stateToFr = (dossierStateKey?: DossierStateKeys | null): DossierStateValue | '' => dossierStateKey ? DossierState[dossierStateKey] : ''
