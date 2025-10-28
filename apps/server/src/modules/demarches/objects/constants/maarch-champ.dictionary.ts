import { FieldSource, FieldType, FormatFunctionRef } from '@biblio-num/shared'
import {
  MappingColumn,
  MappingColumnWithoutChildren,
} from '../dtos/mapping-column.dto'
import { maarchAnnotationLabel, maarchChampsLabel, maarchPJLabel } from './maarch-champ.enum'

/** Informations du courrier */

export const fieldCourrier: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h20',
  columnLabel: 'Numéro du courrier',
  originalLabel: maarchChampsLabel.courrier,
  type: FieldType.number,
  source: FieldSource.fixField,
}
export const fieldIntituleCourrier: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h22',
  columnLabel: 'Intitulé du courrier',
  originalLabel: maarchChampsLabel.intituleCourrier,
  type: FieldType.string,
  source: FieldSource.champs,
}
export const fieldDateDeclaration: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h39',
  columnLabel: 'Date de déclaration',
  originalLabel: maarchChampsLabel.dateDeclaration,
  type: FieldType.date,
  source: FieldSource.fixField,
}

export const fieldNumPublication: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h38',
  columnLabel: 'Numéro de publication',
  originalLabel: maarchChampsLabel.numPublication,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldEtatDossier: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h49',
  columnLabel: 'État du dossier',
  originalLabel: maarchChampsLabel.etatDossier,
  type: FieldType.enum,
  source: FieldSource.fixField,
  formatFunctionRef: FormatFunctionRef.status,
}

/** ----------------------------------- */

/** Informations de l'association */

export const fieldNumRna: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h35',
  columnLabel: 'Numéro RNA',
  originalLabel: maarchChampsLabel.numRna,
  type: FieldType.string,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.rna,
}

export const fieldNomAssociation: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h25',
  columnLabel: "Titre complet de l'association",
  originalLabel: maarchChampsLabel.nomAssociation,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldPrefecture: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h21',
  columnLabel: 'Préfecture de rattachement',
  originalLabel: maarchChampsLabel.prefecture,
  type: FieldType.string,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.prefecture,
}

export const fieldAssociationUnionFederation: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h40',
  columnLabel: "L'association est-elle une union/fédération d'association cultuelle ?",
  originalLabel: maarchChampsLabel.associationUnionFederation,
  type: FieldType.boolean,
  source: FieldSource.champs,
}

export const fieldNumeroRue: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h26',
  columnLabel: 'Numéro de rue',
  originalLabel: maarchChampsLabel.numeroRue,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldNomRue: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h52',
  columnLabel: 'Nom de rue',
  originalLabel: maarchChampsLabel.libelleRue,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldCodePostal: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h50',
  columnLabel: 'Code postal',
  originalLabel: maarchChampsLabel.codePostal,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldVille: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h51',
  columnLabel: 'Ville',
  originalLabel: maarchChampsLabel.ville,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldTelephone: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h27',
  columnLabel: 'Téléphone',
  originalLabel: maarchChampsLabel.telephone,
  type: FieldType.string,
  source: FieldSource.champs,
}

/** ----------------------------------- */

/** Informations de l'association */

export const fieldNomDeclarant: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h36',
  columnLabel: 'Nom',
  originalLabel: maarchChampsLabel.numEt,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldPrenomDeclarant: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h37',
  columnLabel: 'Prénom',
  originalLabel: maarchChampsLabel.informationDeclarant,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldEmailDeclarant: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h28',
  columnLabel: 'Email de contact',
  originalLabel: maarchChampsLabel.emailAssociation,
  type: FieldType.string,
  source: FieldSource.champs,
}

/** ----------------------------------- */

export const fieldPjIntitule: MappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h41',
  columnLabel: 'Intitulé de la PJ',
  originalLabel: maarchPJLabel.intitulePj,
  type: FieldType.file,
  source: FieldSource.champs,
  formatFunctionRef: FormatFunctionRef.file,
}

export const fieldPiecesJointes: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h44',
  columnLabel: 'Pièces jointes',
  originalLabel: maarchChampsLabel.piecesJointes,
  type: FieldType.string,
  source: FieldSource.champs,
  children: [fieldPjIntitule],
}

export const fieldAnnotationText: MappingColumnWithoutChildren = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h42',
  columnLabel: 'Annotation',
  originalLabel: maarchAnnotationLabel.annotationText,
  type: FieldType.string,
  source: FieldSource.champs,
}

export const fieldAnnotations: MappingColumn = {
  id: '9098ce70-4378-2d7e-bkb9-b76fb7b67h45',
  columnLabel: 'Annotations du courrier',
  originalLabel: maarchChampsLabel.annotation,
  type: FieldType.string,
  source: FieldSource.annotation,
  children: [
    fieldAnnotationText,
  ],
}

export const maarchFieldMappings: {
  // eslint-disable-next-line no-unused-vars
  [key in keyof typeof maarchChampsLabel]: MappingColumn
} = {
  courrier: fieldCourrier,
  prefecture: fieldPrefecture,
  intituleCourrier: fieldIntituleCourrier,
  nomAssociation: fieldNomAssociation,
  etatDossier: fieldEtatDossier,
  numeroRue: fieldNumeroRue,
  libelleRue: fieldNomRue,
  codePostal: fieldCodePostal,
  ville: fieldVille,
  telephone: fieldTelephone,
  emailAssociation: fieldEmailDeclarant,
  numRna: fieldNumRna,
  numEt: fieldNomDeclarant,
  associationUnionFederation: fieldAssociationUnionFederation,
  informationDeclarant: fieldPrenomDeclarant,
  numPublication: fieldNumPublication,
  dateDeclaration: fieldDateDeclaration,
  piecesJointes: fieldPiecesJointes,
  annotation: fieldAnnotations,
}

export const maarchFieldMappingsArray: MappingColumn[] = [
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
