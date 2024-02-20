import { FieldSource, FieldType } from '@biblio-num/shared'
import { FixFieldValueGetter } from './fix-field-value-getter'
import type { PersonnePhysique, PersonneMorale } from '@dnum-mi/ds-api-client'
import { TDossierWithPrefecture } from '../../providers/field.service'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

const getFixFieldFnByMappingId = (
  mappingId: Record<string, string>,
  getSrcFn: (dossier:TDossierWithPrefecture) => NonNullable<unknown> | null)
  : Record<string, FixFieldValueGetter> => Object.fromEntries(
  Object.entries(mappingId).map(([key, id]) => {
    const fn:FixFieldValueGetter = (dossier) => {
      const objSrc = getSrcFn(dossier)
      return objSrc ? objSrc[key] : null
    }
    return [id, fn]
  }),
)
//#region personne physique
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
//#endregion

//#region personne moral association
const persMoralAssoIdMapping = {
  dateCreation: '6d516e67-3218-49f4-8a88-ca5045ad9c81',
  dateDeclaration: '6d516e67-3218-49f4-8a88-ca5045ad9c82',
  datePublication: '6d516e67-3218-49f4-8a88-ca5045ad9c83',
  objet: '6d516e67-3218-49f4-8a88-ca5045ad9c84',
  rna: '6d516e67-3218-49f4-8a88-ca5045ad9c85',
  titre: '6d516e67-3218-49f4-8a88-ca5045ad9c86',
}
const fixFieldsAssociation: MappingColumn[] = [
  // {
  //   id: '6d516e67-3218-49f4-8a88-ca5045ad9c80',
  //   columnLabel: null,
  //   originalLabel: 'Demandeur-Association',
  //   type: FieldType.string,
  //   source: FieldSource.fixField,
  // },
  {
    id: persMoralAssoIdMapping.dateCreation,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: Date creation',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  {
    id: persMoralAssoIdMapping.dateDeclaration,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: Date declaration',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  {
    id: persMoralAssoIdMapping.datePublication,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: Date publication',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  {
    id: persMoralAssoIdMapping.objet,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: Objet',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralAssoIdMapping.rna,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: RNA',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralAssoIdMapping.titre,
    columnLabel: null,
    originalLabel: 'Demandeur-Association: Titre',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
]

const fixFieldValueFunctionsPersMoralAsso: Record<string, FixFieldValueGetter> = getFixFieldFnByMappingId(
  persMoralAssoIdMapping,
  (dossier) => (dossier.demandeur as PersonneMorale)?.association)

//#endregion
//#region personne moral entreprise
const persMoralEntrepriseIdMapping = {
  nom: '6d516e67-3218-49f4-8a88-ca5045ad9d01',
  prenom: '6d516e67-3218-49f4-8a88-ca5045ad9d02',
  nomCommercial: '6d516e67-3218-49f4-8a88-ca5045ad9d03',
  raisonSociale: '6d516e67-3218-49f4-8a88-ca5045ad9d04',
  siren: '6d516e67-3218-49f4-8a88-ca5045ad9d05',
  siretSiegeSocial: '6d516e67-3218-49f4-8a88-ca5045ad9d06',
  numeroTvaIntracommunautaire: '6d516e67-3218-49f4-8a88-ca5045ad9d07',
  formeJuridique: '6d516e67-3218-49f4-8a88-ca5045ad9d08',
  formeJuridiqueCode: '6d516e67-3218-49f4-8a88-ca5045ad9d09',
  inlineAdresse: '6d516e67-3218-49f4-8a88-ca5045ad9d0a',
  attestationFiscaleAttachment: '6d516e67-3218-49f4-8a88-ca5045ad9d0b',
  attestationSocialeAttachment: '6d516e67-3218-49f4-8a88-ca5045ad9d0c',
  capitalSocial: '6d516e67-3218-49f4-8a88-ca5045ad9d0d',
  codeEffectifEntreprise: '6d516e67-3218-49f4-8a88-ca5045ad9d0e',
  dateCreation: '6d516e67-3218-49f4-8a88-ca5045ad9d0f',
  // effectifAnnuel: {
  //   nb:
  //   periode:
  // },
  // effectifMensuel: {
  //   nb:
  //   periode:
  // },
  etatAdministratif: '6d516e67-3218-49f4-8a88-ca5045ad9d30',
}

const fixFieldsEntreprise: MappingColumn[] = [
  {
    id: persMoralEntrepriseIdMapping.nom,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Nom',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.prenom,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Prénom',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.nomCommercial,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Nom commercial',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.raisonSociale,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Raison sociale',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.siren,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Siren',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.siretSiegeSocial,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Siret siege social',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.numeroTvaIntracommunautaire,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: numero TVA intracommunautaire',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.formeJuridique,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Forme juridique',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.formeJuridiqueCode,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Forme juridique code',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.inlineAdresse,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Adresse',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  // TODO: Voir l'utilité et Tester le récupération des fichiers dans l'object demandeur
  // {
  //   id: persMoralEntrepriseIdMapping.attestationFiscaleAttachment,
  //   columnLabel: null,
  //   originalLabel: 'Demandeur-Entreprise: Attestation fiscale',
  //   type: FieldType.file,
  //   source: FieldSource.fixField,
  // },
  // {
  //   id: persMoralEntrepriseIdMapping.attestationSocialeAttachment,
  //   columnLabel: null,
  //   originalLabel: 'Demandeur-Entreprise: Attestation sociale',
  //   type: FieldType.file,
  //   source: FieldSource.fixField,
  // },
  {
    id: persMoralEntrepriseIdMapping.capitalSocial,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Capital social',
    type: FieldType.number,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.codeEffectifEntreprise,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Code effectif entreprise',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: persMoralEntrepriseIdMapping.dateCreation,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Date de création',
    type: FieldType.date,
    source: FieldSource.fixField,
  },
  // TODO: Voir l'utilité
  // {
  //   id: '6d516e67-3218-49f4-8a88-ca5045ad9d10',
  //   columnLabel: null,
  //   originalLabel: "Demandeur-Entreprise: Nombre d'effectif annuel",
  //   type: FieldType.number,
  //   source: FieldSource.fixField,
  // },
  // {
  //   id: '6d516e67-3218-49f4-8a88-ca5045ad9d11',
  //   columnLabel: null,
  //   originalLabel: "Demandeur-Entreprise: période de l'effectif annuel",
  //   type: FieldType.string,
  //   source: FieldSource.fixField,
  // },
  // {
  //   id: '6d516e67-3218-49f4-8a88-ca5045ad9d20',
  //   columnLabel: null,
  //   originalLabel: "Demandeur-Entreprise: Nombre d'effectif mensuel",
  //   type: FieldType.number,
  //   source: FieldSource.fixField,
  // },
  // {
  //   id: '6d516e67-3218-49f4-8a88-ca5045ad9d21',
  //   columnLabel: null,
  //   originalLabel: "Demandeur-Entreprise: période de l'effectif mensuel",
  //   type: FieldType.string,
  //   source: FieldSource.fixField,
  // },
  {
    id: persMoralEntrepriseIdMapping.etatAdministratif,
    columnLabel: null,
    originalLabel: 'Demandeur-Entreprise: Etat administratif',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
]

const fixFieldValueFnsPersMoralEntreprise: Record<string, FixFieldValueGetter> = getFixFieldFnByMappingId(
  persMoralEntrepriseIdMapping,
  (dossier) => (dossier.demandeur as PersonneMorale)?.entreprise)

//#endregion

//#region personne moral Adresse
const fixFieldsAddressIdMapping = {
  label: '6d516e67-3218-49f4-8a88-ca5045ad9e00',
  cityCode: '6d516e67-3218-49f4-8a88-ca5045ad9e01',
  cityName: '6d516e67-3218-49f4-8a88-ca5045ad9e02',
  departmentCode: '6d516e67-3218-49f4-8a88-ca5045ad9e03',
  departmentName: '6d516e67-3218-49f4-8a88-ca5045ad9e04',
  postalCode: '6d516e67-3218-49f4-8a88-ca5045ad9e05',
  regionCode: '6d516e67-3218-49f4-8a88-ca5045ad9e06',
  regionName: '6d516e67-3218-49f4-8a88-ca5045ad9e07',
  streetAddress: '6d516e67-3218-49f4-8a88-ca5045ad9e08',
  streetName: '6d516e67-3218-49f4-8a88-ca5045ad9e09',
  streetNumber: '6d516e67-3218-49f4-8a88-ca5045ad9e0a',
  type: '6d516e67-3218-49f4-8a88-ca5045ad9e0b',
}

const fixFieldsAddress: MappingColumn[] = [
  {
    id: fixFieldsAddressIdMapping.label,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Libellé complet de l’adresse',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.cityCode,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Code INSEE de la commune',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.cityName,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Nom de la commune',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.departmentCode,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: N° de département',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.departmentName,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Nom de département',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.postalCode,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Code postal',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.regionCode,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: N° de region',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.regionName,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Nom de région',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.streetAddress,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Numéro éventuel et nom de voie ou lieu dit',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.streetName,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Nom de voie ou lieu dit',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.streetNumber,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Numéro avec indice de répétition éventuel (bis, ter, A, B)',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
  {
    id: fixFieldsAddressIdMapping.type,
    columnLabel: null,
    originalLabel: 'Demandeur-Adresse: Type',
    type: FieldType.string,
    source: FieldSource.fixField,
  },
]

const fixFieldValueFnsPersMoralAdresse: Record<string, FixFieldValueGetter> = getFixFieldFnByMappingId(
  fixFieldsAddressIdMapping,
  (dossier) => (dossier.demandeur as PersonneMorale)?.address)
//#endregion

//#region personne moral
const persMoralIdMapping = {
  libelleNaf: '6d516e67-3218-49f4-8a88-ca5045ad9c91',
  naf: '6d516e67-3218-49f4-8a88-ca5045ad9c93',
  siret: '6d516e67-3218-49f4-8a88-ca5045ad9c94',
  siegeSocial: '6d516e67-3218-49f4-8a88-ca5045ad9c95',
}

const fixFieldValueFnsPersMoral: Record<string, FixFieldValueGetter> = getFixFieldFnByMappingId(
  persMoralIdMapping,
  (dossier) => (dossier.demandeur as PersonneMorale))

//#endregion

export const fixFieldsDemandeur: MappingColumn[] = [
  {
    id: '6d516e67-3218-49f4-8a88-ca5045ad9c6e',
    columnLabel: null,
    originalLabel: 'Demandeur: Personne physique',
    type: FieldType.string,
    source: FieldSource.fixField,
    children: [
      //#region PersonnePhysique
      ...fixFieldsPersonnePhysique,
      //#endregion
    ],
  },
  {
    id: '6d516e67-3218-49f4-8a88-ca5045ad9c6d',
    columnLabel: null,
    originalLabel: 'Demandeur: Personne moral',
    type: FieldType.string,
    source: FieldSource.fixField,
    children: [
    //#region PersonneMoral
      ...fixFieldsAssociation,
      ...fixFieldsEntreprise,
      {
        id: persMoralIdMapping.libelleNaf,
        columnLabel: null,
        originalLabel: 'Demandeur: Libelle NAF',
        type: FieldType.string,
        source: FieldSource.fixField,
      },
      {
        id: persMoralIdMapping.naf,
        columnLabel: null,
        originalLabel: 'Demandeur: NAF',
        type: FieldType.string,
        source: FieldSource.fixField,
      },

      {
        id: persMoralIdMapping.siret,
        columnLabel: null,
        originalLabel: 'Demandeur: SIRET',
        type: FieldType.string,
        source: FieldSource.fixField,
      },

      {
        id: persMoralIdMapping.siegeSocial,
        columnLabel: null,
        originalLabel: 'Demandeur: Siege social',
        type: FieldType.boolean,
        source: FieldSource.fixField,
      },
      ...fixFieldsAddress,
      //#endregion
    ],
  },
]

export const fixFieldValueFunctionsDemandeur: Record<string, FixFieldValueGetter> = {
  ...fixFieldValueFunctionsPersonnePhysique,
  ...fixFieldValueFnsPersMoralAdresse,
  ...fixFieldValueFunctionsPersMoralAsso,
  ...fixFieldValueFnsPersMoralEntreprise,
  ...fixFieldValueFnsPersMoral,
}
