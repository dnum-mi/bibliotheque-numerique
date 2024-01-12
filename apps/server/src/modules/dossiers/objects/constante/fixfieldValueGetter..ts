import { TDossierWithPrefecture } from '@/modules/dossiers/providers/field.service'

export type FixFieldValueGetter = (
  dossier: TDossierWithPrefecture,
) => string | number | boolean | Date | null
