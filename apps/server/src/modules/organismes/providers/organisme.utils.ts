import { eOrganismeStatus, ISiafOrganisme } from '@biblio-num/shared'

export const getDissolvedAt = (organisme: ISiafOrganisme): Date | null => (
  (organisme.state === eOrganismeStatus.Dissoute && organisme.stateEffectiveAt) || null
)
