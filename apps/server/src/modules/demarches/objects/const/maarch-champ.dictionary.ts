import { FieldSource, FieldType, FormatFunctionRef } from '@biblio-num/shared'
import { maarchAccuseLabel, maarchAnnotationLabel, maarchChampsLabel, maarchPJLabel } from './maarch-champ.enum'
import { ExtendedMappingColumn, ExtendedMappingColumnWithoutChildren } from './maarch.types'

/** Informations du courrier */

export const fieldCourrier: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h20',
  columnLabel: 'Numéro du courrier',
  originalLabel: 'Numéro du courrier',
  csvColumnLabel: maarchChampsLabel.courrier,
  type: FieldType.number,
  source: FieldSource.fixField,
}
export const fieldIntituleCourrier: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h22',
  columnLabel: 'Intitulé du courrier',
  originalLabel: 'Intitulé du courrier',
  csvColumnLabel: maarchChampsLabel.intituleCourrier,
  type: FieldType.string,
  source: FieldSource.champs,
}
export const fieldDateDeclaration: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h39',
  columnLabel: 'Date de déclaration',
  originalLabel: 'Date de déclaration',
  csvColumnLabel: maarchChampsLabel.dateDeclaration,
  type: FieldType.date,
  source: FieldSource.fixField,
}

export const fieldNumPublication: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h38',
  columnLabel: 'Numéro de publication',
  originalLabel: 'Numéro de publication',
  csvColumnLabel: maarchChampsLabel.numPublication,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldEtatDossier: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h49',
  columnLabel: 'État du dossier',
  originalLabel: 'État du dossier',
  csvColumnLabel: maarchChampsLabel.etatDossier,
  type: FieldType.enum,
  source: FieldSource.fixField,
  formatFunctionRef: FormatFunctionRef.status,
}

/** ----------------------------------- */

/** Informations de l'association */

export const fieldNumRna: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h35',
  columnLabel: 'Numéro RNA',
  originalLabel: 'Numéro RNA',
  csvColumnLabel: maarchChampsLabel.numRna,
  type: FieldType.string,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.rna,
}

export const fieldNomAssociation: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h25',
  columnLabel: "Titre complet de l'association",
  originalLabel: "Titre complet de l'association",
  csvColumnLabel: maarchChampsLabel.nomAssociation,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldPrefecture: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h21',
  columnLabel: 'Préfecture de rattachement',
  originalLabel: 'Préfecture de rattachement',
  csvColumnLabel: maarchChampsLabel.prefecture,
  type: FieldType.string,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.prefecture,
}

export const fieldAssociationUnionFederation: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h40',
  columnLabel: "L'association est-elle une union/fédération d'association cultuelle ?",
  originalLabel: "L'association est-elle une union/fédération d'association cultuelle ?",
  csvColumnLabel: maarchChampsLabel.associationUnionFederation,
  type: FieldType.boolean,
  source: FieldSource.champs,
}

export const fieldNumeroRue: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h26',
  columnLabel: 'Numéro de rue',
  originalLabel: 'Numéro de rue',
  csvColumnLabel: maarchChampsLabel.numeroRue,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldNomRue: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h52',
  columnLabel: 'Nom de rue',
  originalLabel: 'Nom de rue',
  csvColumnLabel: maarchChampsLabel.libelleRue,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldCodePostal: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h50',
  columnLabel: 'Code postal',
  originalLabel: 'Code postal',
  csvColumnLabel: maarchChampsLabel.codePostal,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldVille: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h51',
  columnLabel: 'Ville',
  originalLabel: 'Ville',
  csvColumnLabel: maarchChampsLabel.ville,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldTelephone: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h27',
  columnLabel: 'Téléphone',
  originalLabel: 'Téléphone',
  csvColumnLabel: maarchChampsLabel.telephone,
  type: FieldType.string,
  source: FieldSource.champs,
}

/** ----------------------------------- */

/** Informations de l'association */

export const fieldNomDeclarant: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h36',
  columnLabel: 'Nom',
  originalLabel: 'Nom',
  csvColumnLabel: maarchChampsLabel.numEt,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldPrenomDeclarant: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h37',
  columnLabel: 'Prénom',
  originalLabel: 'Prénom',
  csvColumnLabel: maarchChampsLabel.informationDeclarant,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldEmailDeclarant: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h28',
  columnLabel: 'Email de contact',
  originalLabel: 'Email de contact',
  csvColumnLabel: maarchChampsLabel.emailAssociation,
  type: FieldType.string,
  source: FieldSource.champs,
}

/** ----------------------------------- */

export const fieldCourrierFileIntitule: ExtendedMappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h80',
  columnLabel: 'Nom du fichier courrier',
  originalLabel: 'Nom du fichier courrier',
  csvColumnLabel: maarchChampsLabel.nomCourrier,
  type: FieldType.file,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.file,
}

export const fieldAccuseReceptionIntitule: ExtendedMappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h91',
  columnLabel: 'Accusé de réception',
  originalLabel: 'Accusé de réception',
  csvColumnLabel: maarchAccuseLabel.filename,
  type: FieldType.file,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.file,
}

export const fieldAccusesReception: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h90',
  columnLabel: 'Accusés de réception',
  originalLabel: 'Accusés de réception',
  csvColumnLabel: maarchChampsLabel.accusesReception,
  type: FieldType.file,
  source: FieldSource.champs,
  children: [fieldAccuseReceptionIntitule],
}

export const fieldPjIntitule: ExtendedMappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h41',
  columnLabel: 'Intitulé de la PJ',
  originalLabel: 'Intitulé de la PJ',
  csvColumnLabel: maarchPJLabel.intitulePj,
  type: FieldType.file,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.file,
}

export const fieldPiecesJointes: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h44',
  columnLabel: 'Pièces jointes',
  originalLabel: 'Pièces jointes',
  csvColumnLabel: maarchChampsLabel.piecesJointes,
  type: FieldType.string,
  source: FieldSource.champs,
  children: [fieldPjIntitule],
}

export const fieldAnnotationText: ExtendedMappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h42',
  columnLabel: 'Annotation',
  originalLabel: 'Annotation',
  csvColumnLabel: maarchAnnotationLabel.annotationText,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldAnnotations: ExtendedMappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h45',
  columnLabel: 'Annotations du courrier',
  originalLabel: 'Annotations du courrier',
  csvColumnLabel: maarchChampsLabel.annotation,
  type: FieldType.string,
  source: FieldSource.annotation,
  children: [
    fieldAnnotationText,
  ],
}

export const maarchFieldMappingsArray: ExtendedMappingColumn[] = [
  {
    id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h46',
    originalLabel: 'Informations relatives au courrier',
    isHeader: true,
    type: FieldType.string,
    source: FieldSource.champs,
  },
  fieldCourrier,
  fieldIntituleCourrier,
  fieldEtatDossier,
  fieldDateDeclaration,
  fieldNumPublication,
  {
    id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h47',
    originalLabel: "Informations relatives à l'association",
    isHeader: true,
    type: FieldType.string,
    source: FieldSource.champs,
  },
  fieldNumRna,
  fieldNomAssociation,
  fieldPrefecture,
  fieldAssociationUnionFederation,
  fieldNumeroRue,
  fieldNomRue,
  fieldCodePostal,
  fieldVille,
  fieldTelephone,
  {
    id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h48',
    originalLabel: 'Informations relatives au déclarant',
    isHeader: true,
    type: FieldType.string,
    source: FieldSource.champs,
  },
  fieldPrenomDeclarant,
  fieldNomDeclarant,
  fieldEmailDeclarant,
  fieldPiecesJointes,
  fieldAnnotations,
]
