import { eOrganismeStatus, ISiafOrganisme } from '@biblio-num/shared'

export const getDissolvedAt = (organisme: ISiafOrganisme): Date | null => (
  (organisme.status === eOrganismeStatus.Dissoute && organisme.statusEffectiveAt) || null
)
