import type { DossierState } from '@dnum-mi/ds-api-client'

export type DossierStateKeys = typeof DossierState[keyof typeof DossierState]
