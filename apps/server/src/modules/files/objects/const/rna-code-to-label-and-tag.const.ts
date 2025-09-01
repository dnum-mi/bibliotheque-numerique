import { eFileTag, FileTagKey } from '@biblio-num/shared'

/* eslint-disable */
/*
  All the RNA codes can be found here :
  https://entreprise.api.gouv.fr/developpeurs/openapi#tag/Informations-generales/paths/~1v4~1djepva~1api-association~1associations~1%7Bsiren_or_rna%7D/get
  under the section "code" for documents_rna in the 200 response documentation.
  only the code usefull for this project are listed in here
 */
/* eslint-enable */
export const rnaFileCodes = [
  'STC', // 'Statuts',
  'LDC', // 'Liste dirigeants',
  'PV', // 'Procès verbal',
  'ARR', // 'Arrêté',
  'DCR', // 'Décret',
  'ETC', // 'Etablissement(s) (liste complète)',
  'FIN', // 'Document financier',
  'IMC', // 'Immeuble(s) (liste complète)',
  'RIN', // 'règlement intérieur',
] as const

export type RnaFileCodeKey = (typeof rnaFileCodes)[number]
export type TLabelAndTag = { tag: FileTagKey; label: string }
export const dRnaCodeToLabelAndTag: Record<
  RnaFileCodeKey,
  TLabelAndTag
> = {
  STC: {
    tag: eFileTag.status,
    label: 'Statuts',
  },
  LDC: {
    tag: eFileTag.other,
    label: 'Liste dirigeants',
  },
  PV: {
    tag: eFileTag.pv,
    label: 'PV',
  },
  ARR: {
    tag: eFileTag.other,
    label: 'Arrêté',
  },
  DCR: {
    tag: eFileTag.other,
    label: 'Décret',
  },
  ETC: {
    tag: eFileTag.other,
    label: 'Etablissements',
  },
  FIN: {
    tag: eFileTag.account,
    label: 'Comptes',
  },
  IMC: {
    tag: eFileTag.other,
    label: 'Immeubles',
  },
  RIN: {
    tag: eFileTag.other,
    label: 'Règlement intérieur',
  },
}
