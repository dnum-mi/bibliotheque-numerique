import { createEnum } from 'factories'

export const rnaTypeFileArray = [
  'Acte du ministère',
  'Acte notarié',
  'Adhésion(s) (liste complète)',
  'Adhésion(s) (modificatif)',
  'Arrêté',
  'Document financier',
  'Décret',
  'Etablissement(s) (liste complète)',
  'Etablissement(s) (modificatif)',
  'Immeuble(s) (Modificatif)',
  'Immeuble(s) (liste complète)',
  'Jugement TGI',
  'Lettre',
  'Lettre de déclaration',
  'Lettre de démission',
  'Liste dirigeants',
  'Procès verbal',
  'Récépissé délivré',
  'Statuts',
  'fiche de rejet télé-déclaration',
  'formulaire déclaration',
  'lettre de mandat',
  'liste ass. absorbées',
  'réglement intérieur',
  'télé-récépissé signé automatiquement',
  'télé-récépissé signé manuellement',
] as const

export type RnaTypeFileKey = (typeof rnaTypeFileArray)[number]
export const eRnaTypeFile = createEnum(rnaTypeFileArray)
