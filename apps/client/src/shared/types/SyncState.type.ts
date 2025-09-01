import type { ISyncState } from '@biblio-num/shared'

export type TSyncState = (ISyncState & { id: number }) | undefined | null
