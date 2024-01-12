import { FieldSource, FieldType, MappingColumn } from '@biblio-num/shared'
import { FixFieldValueGetter } from './fixfieldValueGetter.'
import type { PersonnePhysique } from '@dnum-mi/ds-api-client'

const persPhysiqueIdMapping = {
  civilite: '6d516e67-3218-49f4-8a88-ca5045ad9c70',
  nom: '6d516e67-3218-49f4-8a88-ca5045ad9c71',
  prenom: '6d516e67-3218-49f4-8a88-ca5045ad9c72',
  dateDeNaissance: '6d516e67-3218-49f4-8a88-ca5045ad9c73',
}
const fixFieldsPersonnePhysique: MappingColumn[] = [
  {
    id: persPhysiqueIdMapping.civilite,
    columnLabel: null,
    originalLabel: 'Demandeur: Civilité',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persPhysiqueIdMapping.nom,
    columnLabel: null,
    originalLabel: 'Demandeur: Nom',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persPhysiqueIdMapping.prenom,
    columnLabel: null,
    originalLabel: 'Demandeur: Prénom',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persPhysiqueIdMapping.dateDeNaissance,
    columnLabel: null,
    originalLabel: 'Demandeur: Date de naissance',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
]

const fixFieldValueFunctionsPersonnePhysique: Record<string, FixFieldValueGetter> = Object.fromEntries(
  Object.entries(persPhysiqueIdMapping).map(([key, id]) => {
    const fn:FixFieldValueGetter = (dossier) => {
      const demandeur = (dossier.demandeur as PersonnePhysique)
      return demandeur ? demandeur[key] : null
    }
    return [id, fn]
  }),
)

export const fixFieldsDemandeur: MappingColumn[] = [
  {
    id: '6d516e67-3218-49f4-8a88-ca5045ad9c6e',
    columnLabel: null,
    originalLabel: 'Demandeur',
    type: FieldType.string,
    source: FieldSource.fixField,
    children: [
      //#region PersonnePhysique
      ...fixFieldsPersonnePhysique,
      //#endregion
    ],

  },

]

export const fixFieldValueFunctionsDemandeur: Record<string, FixFieldValueGetter> = {
  ...fixFieldValueFunctionsPersonnePhysique,
}
