import { INestApplication } from '@nestjs/common'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

import * as dayjs from 'dayjs'
import { FileService } from '@/modules/files/providers/file.service'
import stream, { PassThrough, Readable } from 'stream'
import { AxiosHeaders, AxiosResponse } from 'axios'
import { S3 } from 'aws-sdk/clients/browser_default'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { In } from 'typeorm'
import { InstructionTimesService } from '@/modules/instruction_time/instruction_times.service'
import { FormatFunctionRef } from '@biblio-num/shared'

const expectedFixFieldsTotalAmount = (): Partial<Field>[] => [
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'number',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c30',
    stringValue: '2000',
    dateValue: null,
    numberValue: 2000,
    parentRowIndex: null,
    label: 'Montant total dossier',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'number',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c31',
    stringValue: '0',
    dateValue: null,
    numberValue: 0,
    parentRowIndex: null,
    label: 'Montant total champs',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'number',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c32',
    stringValue: '2000',
    dateValue: null,
    numberValue: 2000,
    parentRowIndex: null,
    label: 'Montant total excel',
    rawJson: null,
  },
]
const expectedFixFieldExcelRepetition = (): Partial<Field>[] => [
  {
    fieldSource: 'fix-field',
    dsChampType: 'RepetitionChamp',
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97b20',
    stringValue: '',
    dateValue: null,
    numberValue: null,
    parentRowIndex: null,
    label: 'Excel: Pièce jointe',
    rawJson: null,
  }]
const expectedFixFieldsExcel = (): Partial<Field>[] => [
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'date',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c20',
    stringValue: '28/12/2023',
    numberValue: null,
    parentRowIndex: 0,
    label: 'Excel: Date du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'date',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c20',
    stringValue: '28/12/2023',
    numberValue: null,
    parentRowIndex: 1,
    label: 'Excel: Date du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c21',
    stringValue: 'PM',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 0,
    label: 'Excel: Type de personnalité du contributeur',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c21',
    stringValue: 'PM',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 1,
    label: 'Excel: Type de personnalité du contributeur',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: 'country',
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c22',
    stringValue: 'AUTRICHE',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 1,
    label: "Excel: Pays d'origine",
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: 'country',
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c22',
    stringValue: 'AUTRICHE',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 0,
    label: "Excel: Pays d'origine",
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c23',
    stringValue: 'RP',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 1,
    label: 'Excel: Nature du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c23',
    stringValue: 'RP',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 0,
    label: 'Excel: Nature du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c24',
    stringValue: 'D',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 0,
    label: 'Excel: Caractère du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c24',
    stringValue: 'D',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 1,
    label: 'Excel: Caractère du financement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c25',
    stringValue: 'CB',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 1,
    label: 'Excel: Mode de paiement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'string',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c25',
    stringValue: 'CB',
    dateValue: null,
    numberValue: null,
    parentRowIndex: 0,
    label: 'Excel: Mode de paiement',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'number',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c26',
    stringValue: '1000',
    dateValue: null,
    numberValue: 1000,
    parentRowIndex: 0,
    label: 'Excel: Montant ou valeur à déclarer en euros',
    rawJson: null,
  },
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    type: 'number',
    formatFunctionRef: null,
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c26',
    stringValue: '1000',
    dateValue: null,
    numberValue: 1000,
    parentRowIndex: 1,
    label: 'Excel: Montant ou valeur à déclarer en euros',
    rawJson: null,
  },
]
const expectedFixFieldsDates = (
  dossierId,
  dateDepot = null,
  datePassageEnInstruction = null,
  datePassageEnConstruction = null,
): Partial<Field>[] => [
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c11',
    label: 'Date de dépot',
    formatFunctionRef: null,
    type: 'date',
    fieldSource: 'fix-field',
    stringValue: dateDepot ? dayjs(dateDepot).toISOString() : '',
    dateValue: dateDepot ? dayjs(dateDepot).toDate() : null,
    numberValue: null,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c12',
    label: 'Date de passage en instruction',
    formatFunctionRef: null,
    type: 'date',
    fieldSource: 'fix-field',
    stringValue: dateDepot ? dayjs(datePassageEnInstruction).toISOString() : '',
    dateValue: dateDepot ? dayjs(datePassageEnInstruction).toDate() : null,
    numberValue: null,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c13',
    label: 'Date de passage en construction',
    formatFunctionRef: null,
    type: 'date',
    fieldSource: 'fix-field',
    stringValue: dateDepot
      ? dayjs(datePassageEnConstruction).toISOString()
      : '',
    dateValue: dateDepot ? dayjs(datePassageEnConstruction).toDate() : null,
    numberValue: null,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
]

//#region personne physique
const expectedFixFieldPersonnePhysique = [
  {
    fieldSource: 'fix-field',
    dsChampType: null,
    formatFunctionRef: null,
    label: 'Demandeur: Civilité',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c70',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: Nom',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c71',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: Prénom',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c72',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: Date de naissance',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c73',
    stringValue: '',
    type: 'date',
  }]
const nbFieldsDmandeurPersonnePhysique = expectedFixFieldPersonnePhysique.length
//#endregion

//#region personne moral
const expectedFixFieldsAsso = [
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: Date creation',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c81',
    stringValue: '',
    type: 'date',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: Date declaration',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c82',
    stringValue: '',
    type: 'date',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: Date publication',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c83',
    stringValue: '',
    type: 'date',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: Objet',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c84',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: RNA',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c85',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Association: Titre',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c86',
    stringValue: '',
    type: 'string',
  },
]
const expectedFixFieldsEntreprise = [
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Nom',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d01',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Prénom',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d02',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Nom commercial',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d03',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Raison sociale',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d04',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Siren',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d05',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Siret siege social',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d06',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: numero TVA intracommunautaire',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d07',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Forme juridique',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d08',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Forme juridique code',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d09',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Adresse',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0a',
    stringValue: '',
    type: 'string',
  },
  //#region  TODO: Voir l'utilité et Tester le récupération des fichiers dans l'object demandeur
  // {
  //   dsChampType: null,
  //   fieldSource: 'fix-field',
  //   formatFunctionRef: null,
  //   label: 'Demandeur-Entreprise: Attestation fiscale',
  //   numberValue: null,
  //   parentId: null,
  //   parentRowIndex: null,
  //   rawJson: null,
  //   sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0b',
  //   stringValue: '',
  //   type: 'file',
  // },
  // {
  //   dsChampType: null,
  //   fieldSource: 'fix-field',
  //   formatFunctionRef: null,
  //   label: 'Demandeur-Entreprise: Attestation sociale',
  //   numberValue: null,
  //   parentId: null,
  //   parentRowIndex: null,
  //   rawJson: null,
  //   sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0c',
  //   stringValue: '',
  //   type: 'file',
  // },
  //#endregion
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Capital sociale',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0d',
    stringValue: '',
    type: 'number',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Code effectif entreprise',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0e',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Date de création',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d0f',
    stringValue: '',
    type: 'date',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Entreprise: Etat administratif',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9d30',
    stringValue: '',
    type: 'string',
  },
]
const expectedFixFieldsAddress = [
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Libellé complet de l’adresse',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e00',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Code INSEE de la commune',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e01',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Nom de la commune',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e02',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: N° de département',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e03',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Nom de département',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e04',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Code postal',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e05',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: N° de region',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e06',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Nom de région',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e07',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Numéro éventuel et nom de voie ou lieu dit',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e08',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Nom de voie ou lieu dit',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e09',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Numéro avec indice de répétition éventuel (bis, ter, A, B)',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e0a',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur-Adresse: Type',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9e0b',
    stringValue: '',
    type: 'string',
  },

]
const expectedFixFieldsPersMoral = [
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: Libelle NAF',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c91',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: NAF',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c93',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: SIRET',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c94',
    stringValue: '',
    type: 'string',
  },
  {
    dsChampType: null,
    fieldSource: 'fix-field',
    formatFunctionRef: null,
    label: 'Demandeur: Siege social',
    numberValue: null,
    parentId: null,
    parentRowIndex: null,
    rawJson: null,
    sourceId: '6d516e67-3218-49f4-8a88-ca5045ad9c95',
    stringValue: '',
    type: 'string',
  },
]

//#endregion
describe('Syncronisation ', () => {
  let app: INestApplication
  let cookies: Cookies
  let fileService: FileService
  let organismeService: OrganismeService
  let dossierService: DossierService
  let fieldService: FieldService
  let demarcheService: DemarcheService
  let instructionTimeService: InstructionTimesService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    fileService = testingModule.fileService as FileService
    organismeService = await app.resolve(OrganismeService)
    dossierService = await app.resolve(DossierService)
    fieldService = await app.resolve(FieldService)
    demarcheService = await app.resolve(DemarcheService)
    instructionTimeService = await app.resolve(InstructionTimesService)
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('Should return 401', async () => {
    return request(app.getHttpServer())
      .post('/demarches/synchro-dossiers')
      .expect(401)
  })

  it('Should return 403 for user else than sudo', async () => {
    return request(app.getHttpServer())
      .post('/demarches/synchro-dossiers')
      .set('Cookie', [cookies.superadmin])
      .send({
        id: 29,
      })
      .expect(403)
  })

  it('Should return 404 on wrong demarche id', async () => {
    return request(app.getHttpServer())
      .post('/demarches/synchro-dossiers')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 404,
      })
      .expect(404)
  })

  it('should syncronise one dossier of one demarche and create associated fields', async () => {
    // TODO mock it in testing-module
    jest
      .spyOn(fileService, 'downloadFile')
      .mockImplementation((): Promise<AxiosResponse> => {
        const readable = new Readable()
        readable.push('test PJ.')
        readable.push(null)
        return Promise.resolve({
          data: readable,
          headers: {
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          } as unknown as AxiosHeaders,
        } as AxiosResponse)
      })
    jest.spyOn(fileService, 'uploadFromStream').mockImplementation(
      (): {
        passThrough: stream.PassThrough
        promise: Promise<S3.ManagedUpload.SendData>
      } => {
        const passThrough = new PassThrough()
        return {
          passThrough,
          promise: Promise.resolve({
            Key: 'modele-financements-inferieurs-15300.xlsx',
            Location: 'http://s3.com/modele-financements-inferieurs-15300.xlsx',
          } as S3.ManagedUpload.SendData),
        }
      },
    )

    let demarche: Demarche

    return request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 42,
        identification: 'FE',
      })
      .expect(201)
      .then(async (res) => {
        expect(res.body).toEqual({
          message: 'Demarche with DS id 42 has been created.',
        })
        demarche = await dataSource.manager
          .createQueryBuilder(Demarche, 'd')
          .where('d."dsDataJson"->>\'number\' = :id', { id: '42' })
          .select('d.id')
          .addSelect('d.mappingColumns')
          .getOne()

        expect(demarche).toBeDefined()
        expect(demarche.mappingColumns).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
            }),
            expect.objectContaining({
              id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
            }),
          ]),
        )

        expect(demarche.mappingColumns).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'Q2hhbXAtMTExMA==',
              type: 'date',
              source: 'annotation',
            }),
          ]),
        )
        return dataSource.manager.find(Field, {
          where: { dossier: { demarcheId: demarche.id, sourceId: '142' } },
          order: { sourceId: 'ASC', stringValue: 'ASC' },
        })
      })
      .then((fields) => {
        expect(fields.length).toEqual(39 +
                                      nbFieldsDmandeurPersonnePhysique +
                                      expectedFixFieldsAddress.length +
                                      expectedFixFieldsAsso.length +
                                      expectedFixFieldsEntreprise.length +
                                      expectedFixFieldsPersMoral.length,
        )

        const expectedFields = [
          {
            fieldSource: 'fix-field',
            dsChampType: null,
            type: 'enum',
            formatFunctionRef: 'status',
            sourceId: '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4',
            stringValue: 'en_construction',
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: 'Status',
            rawJson: null,
          },
          {
            fieldSource: 'fix-field',
            dsChampType: null,
            type: 'number',
            formatFunctionRef: null,
            sourceId: '96151176-4624-4706-b861-722d2e53545d',
            stringValue: '142',
            dateValue: null,
            numberValue: 142,
            parentId: null,
            parentRowIndex: null,
            label: 'Id démarche simplifié',
            rawJson: null,
          },
          ...expectedFixFieldExcelRepetition(),
          {
            sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c10',
            label: 'préfecture',
            type: 'string',
            fieldSource: 'fix-field',
            formatFunctionRef: FormatFunctionRef.prefecture,
            stringValue: '',
            dateValue: null,
            numberValue: null,
            parentRowIndex: null,
            rawJson: null,
            dsChampType: null,
          },
          ...expectedFixFieldsDates(42),
          ...expectedFixFieldsExcel(),
          ...expectedFixFieldsTotalAmount(),
          {
            fieldSource: 'champs',
            dsChampType: 'RnaChamp',
            type: 'string',
            formatFunctionRef: 'rna',
            sourceId: 'Q2hhbXAtMTA0NQ==',
            stringValue: 'ERROR-W123456789',
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: "Saisir le n°RNA de l'association",
          },
          {
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA2N3ww',
            stringValue: 'Oignon',
            dateValue: null,
            numberValue: null,
            parentRowIndex: 0,
            label: 'Légume',
          },
          {
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA2N3ww',
            stringValue: 'Poivron',
            dateValue: null,
            numberValue: null,
            parentRowIndex: 1,
            label: 'Légume',
          },
          {
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA2Nnww',
            stringValue: 'Fraise',
            dateValue: null,
            numberValue: null,
            parentRowIndex: 0,
            label: 'Fruit',
          },
          {
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA2Nnww',
            stringValue: 'Framboise',
            dateValue: null,
            numberValue: null,
            parentRowIndex: 1,
            label: 'Fruit',
          },
          {
            fieldSource: 'champs',
            dsChampType: 'RepetitionChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA2NQ==',
            stringValue: '',
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: 'Liste de course',
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTEwOQ==',
            dateValue: null,
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTExMA==',
            dateValue: null,
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'IntegerNumberChamp',
            type: 'number',
            sourceId: 'Q2hhbXAtMTExMg==',
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTExMQ==',
            dateValue: null,
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTExMw==',
            dateValue: null,
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTExNA==',
            dateValue: null,
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'DateChamp',
            type: 'date',
            sourceId: 'Q2hhbXAtMTExOA==',
            dateValue: null,
          },
          {
            fieldSource: 'champs',
            dsChampType: 'PieceJustificativeChamp',
            formatFunctionRef: 'file',
            sourceId: 'Q2hhbXAtNTg=',
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: 'Chargement du fichier complété à partir du modèle',
          },
          {
            fieldSource: 'annotation',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtODc=',
            stringValue: "Oui oui c'est fait, merci bien.",
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: 'Une annotation',
          },
        ]

        expect(fields).toMatchObject(
          expect.arrayContaining(expectedFields.map(field => expect.objectContaining(field))),
        )
        const fieldParent = fields.find(field => field.label === 'Liste de course')
        const fieldChilds = fields.filter(field => field.label === 'Légume' || field.label === 'Fruit')

        fieldChilds.forEach(fieldChild => {
          expect(fieldChild.parentId).toEqual(fieldParent.id)
        })

        expect(fields).toEqual(
          expect.not.arrayContaining([
            expect.objectContaining({
              sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
            }),
            expect.objectContaining({
              sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
            }),
          ]),
        )

        // Demandeur: Personne Physique
        expect(fields).toMatchObject(
          expect.arrayContaining(
            expectedFixFieldPersonnePhysique.map(field => expect.objectContaining(field)),
          ))
      })
      .then(() => {
        return dataSource.manager.find(Field, {
          where: { dossier: { sourceId: '143' } },
          order: { sourceId: 'ASC', stringValue: 'ASC' },
        })
      })
      .then((fields) => {
        expect(fields).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining({
              fieldSource: 'annotation',
              dsChampType: 'DateChamp',
              type: 'date',
              sourceId: 'Q2hhbXAtMTEwOQ==',
              dateValue: dayjs().subtract(7, 'days').startOf('day').toDate(),
            }),
          ]),
        )

        expect(fields).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining({
              fieldSource: 'annotation',
              dsChampType: 'DateChamp',
              type: 'date',
              sourceId: 'Q2hhbXAtMTExMA==',
              dateValue: dayjs().subtract(2, 'days').startOf('day').toDate(),
            }),
          ]),
        )

        expect(fields).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining({
              fieldSource: 'annotation',
              dsChampType: 'DateChamp',
              type: 'date',
              sourceId: 'Q2hhbXAtMTExMQ==',
            }),
          ]),
        )

        expect(fields).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining({
              fieldSource: 'annotation',
              dsChampType: 'DateChamp',
              type: 'date',
              sourceId: 'Q2hhbXAtMTExNA==',
            }),
          ]),
        )

        expect(fields).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
              stringValue: 'Instruction',
            }),
            expect.objectContaining({
              sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
              // 60 - (aujourd'hui - la date de reception de la 2eme demande)
              numberValue: 58,
            }),
          ]),
        )
      })
      .then(async () => {
        const dossiers = await dossierService.repository.find({ where: { demarche: { id: demarche.id } } })
        const dids = dossiers.map((d) => d.id)
        await fieldService.repository.delete({ dossierId: In(dids) })
        await instructionTimeService.repository.delete({ dossier: { id: In(dids) } })
        await dossierService.repository.delete({ id: In(dids) })
        await demarcheService.repository.delete({ id: demarche.id })
      })
  })

  it('should associate two organisme upon synchronising', async () => {
    return request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 101,
      })
      .expect(201)
      .then(async (res) => {
        expect(res.body).toEqual({
          message: 'Demarche with DS id 101 has been created.',
        })
        const dossierFoundationChocolat = await dataSource.manager.findOne(
          Dossier,
          {
            where: {
              sourceId: '201',
            },
            relations: ['organisme'],
          },
        )
        expect(dossierFoundationChocolat.organisme).toMatchObject({
          type: 'FE',
          title: 'Titre test avec Baudoin ',

          addressLabel: '4 Rue Judaïque 33000 Bordeaux',
          addressPostalCode: '33000',
          addressCityName: 'Bordeaux',
          addressType: 'housenumber',
          addressStreetAddress: '4 Rue Judaïque',
          addressStreetNumber: '4',
          addressStreetName: 'Rue Judaïque',
          addressDepartmentName: 'Gironde',
          addressDepartmentCode: '33',
          addressRegionName: 'Nouvelle-Aquitaine',
          addressRegionCode: '75',
          email: 'something@rnf.fr',
          phoneNumber: '+33603020105',
          dateCreation: '2023-09-25',
          dateDissolution: null,
          idRna: null,
          rnaJson: null,
          idRnf: '033-FE-00001-02',
        })
        await fieldService.repository.delete({ dossier: { id: dossierFoundationChocolat.id } })
        await dossierService.repository.delete({ sourceId: '201' })
        await organismeService.repository.delete({ idRnf: '033-FE-00001-02' })
        const dossierAssociationFabulous = await dataSource.manager.findOne(
          Dossier,
          {
            where: {
              sourceId: '202',
            },
            relations: ['organisme'],
          },
        )
        expect(dossierAssociationFabulous.organisme).toMatchObject({
          type: 'CULTE',
          title: 'FABULOUS ALL STRINGS BAND',
          addressLabel: '11 RUE Sylvain Sénécaux 27830 Neaufles-Saint-Martin',
          addressPostalCode: '27830',
          addressCityName: 'Neaufles-Saint-Martin',
          addressType: 'RUE',
          addressStreetAddress: '11 RUE Sylvain Sénécaux',
          addressStreetNumber: '11',
          addressStreetName: 'Sylvain Sénécaux',
          email: null,
          phoneNumber: null,
          dateCreation: '2008-09-09',
          dateDissolution: null,
          idRna: 'W271000008',
          idRnf: null,
          rnfJson: null,
        })
        await fieldService.repository.delete({ dossier: { id: dossierAssociationFabulous.id } })
        await dossierService.repository.delete({ sourceId: '202' })
        await organismeService.repository.delete({ idRna: 'W271000008' })
        await dataSource.manager
          .createQueryBuilder()
          .delete()
          .from(Demarche)
          .where("\"dsDataJson\"->>'number' = :id", { id: '101' })
          .execute()
      })
  })

  it('should associate prefecture upon synchronising', async () => {
    return request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 102,
      })
      .expect(201)
      .then(async (res) => {
        expect(res.body).toEqual({
          message: 'Demarche with DS id 102 has been created.',
        })
        const dossierMetz = await dataSource.manager.findOne(
          Dossier,
          {
            where: {
              sourceId: '202',
            },
          },
        )
        expect(dossierMetz.prefecture).toEqual('D57')
        await fieldService.repository.delete({ dossier: { id: dossierMetz.id } })
        await dossierService.repository.delete({ sourceId: '202' })
        const dossierNoPrefecture = await dataSource.manager.findOne(
          Dossier,
          {
            where: {
              sourceId: '203',
            },
          },
        )
        expect(dossierNoPrefecture.prefecture).toEqual(null)
        await fieldService.repository.delete({ dossier: { id: dossierNoPrefecture.id } })
        await dossierService.repository.delete({ sourceId: '203' })
        await dataSource.manager
          .createQueryBuilder()
          .delete()
          .from(Demarche)
          .where("\"dsDataJson\"->>'number' = :id", { id: '102' })
          .execute()
      })
  })

  it('Should get Demandeur to synchronize demarche', async () => {
    const res = await request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 200,
      })
      .expect(201)

    expect(res.body).toEqual({
      message: 'Demarche with DS id 200 has been created.',
    })

    const fields = await dataSource.manager.find(Field, {
      where: { dossier: { sourceId: '200' }, sourceId: In(expectedFixFieldPersonnePhysique.map(ff => ff.sourceId)) },
      order: { sourceId: 'ASC', stringValue: 'ASC' },
    })

    const expectedFieldsDemandeurPhysique:Partial<Field>[] = [
      {
        stringValue: 'M',
        label: 'Demandeur: Civilité',
      },
      {
        stringValue: 'Michel',
        label: 'Demandeur: Nom',
      },
      {
        stringValue: 'MARTIN',
        label: 'Demandeur: Prénom',
      },
    ]

    expect(fields).toMatchObject(
      expect.arrayContaining(expectedFieldsDemandeurPhysique.map(field => expect.objectContaining(field))),
    )
  })

  it('Should get Demandeur Moral to synchronize demarche', async () => {
    const res = await request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookies.sudo])
      .send({
        idDs: 300,
      })
      .expect(201)

    expect(res.body).toEqual({
      message: 'Demarche with DS id 300 has been created.',
    })

    const fields = await dataSource.manager.find(Field, {
      where: {
        dossier: { sourceId: '300' },
        sourceId: In([
          ...expectedFixFieldsPersMoral,
          ...expectedFixFieldsAddress,
          ...expectedFixFieldsAsso,
          ...expectedFixFieldsEntreprise,
        ].map(ff => ff.sourceId)),
      },
    })

    const expectedAddress = [
      {
        label: 'Demandeur-Adresse: Libellé complet de l’adresse',
        stringValue: '149 RTE de la Prêle 01150 Sainte-Julie',
      },
      {
        label: 'Demandeur-Adresse: Code postal',
        stringValue: '01150',
      },
      {
        label: 'Demandeur-Adresse: Nom de la commune',
        stringValue: 'Sainte-Julie',
      },
      {
        label: 'Demandeur-Adresse: Type',
        stringValue: 'RTE',
      },
      {
        label: 'Demandeur-Adresse: Numéro éventuel et nom de voie ou lieu dit',
        stringValue: '149 RTE de la Prêle',
      },
      {
        label: 'Demandeur-Adresse: Numéro avec indice de répétition éventuel (bis, ter, A, B)',
        stringValue: '149',
      },
      {
        label: 'Demandeur-Adresse: Nom de voie ou lieu dit',
        stringValue: 'de la Prêle',
      },
      {
        label: 'Demandeur-Adresse: Nom de département',
        stringValue: '',
      },
      {
        label: 'Demandeur-Adresse: N° de département',
        stringValue: '',
      },
      {
        label: 'Demandeur-Adresse: Nom de région',
        stringValue: '',
      },
      {
        label: 'Demandeur-Adresse: N° de region',
        stringValue: '',
      },
      {
        label: 'Demandeur-Adresse: Code INSEE de la commune',
        stringValue: '',
      },
    ]

    const fieldsAddress = fields.filter(f => f.label.match(/Demandeur-Adresse:.*/))
    expect(fieldsAddress).toHaveLength(expectedAddress.length)

    expectedAddress.forEach(expectedValue => {
      expect(fieldsAddress.find(f => f.label === expectedValue.label)).toMatchObject(
        expectedValue,
      )
    })

    const expectedAsso = [
      { label: 'Demandeur-Association: Date creation', dateValue: new Date('2020-07-26T04:24:48.000Z') },
      { label: 'Demandeur-Association: Date declaration', dateValue: new Date('2020-07-26T04:25:48.000Z') },
      { label: 'Demandeur-Association: Date publication', dateValue: new Date('2020-07-26T04:26:48.000Z') },
      { label: 'Demandeur-Association: Objet', stringValue: 'testeur' },
      { label: 'Demandeur-Association: RNA', stringValue: 'W011006231' },
      { label: 'Demandeur-Association: Titre', stringValue: 'MAIN DANS LA MAIN' },
    ]

    const fieldsAsso = fields.filter(f => f.label.match(/Demandeur-Association:.*/))
    expect(fieldsAsso).toHaveLength(expectedAsso.length)
    expectedAsso.forEach(expectedValue => {
      expect(fieldsAsso.find(f => f.label === expectedValue.label)).toMatchObject(
        expectedValue,
      )
    })

    const expectedEntreprise = [
      { label: 'Demandeur-Entreprise: Capital social', stringValue: '' },
      { label: 'Demandeur-Entreprise: Code effectif entreprise', stringValue: '' },
      { label: 'Demandeur-Entreprise: Date de création', dateValue: new Date('2020-07-21T04:26:48.000Z') },
      { label: 'Demandeur-Entreprise: Etat administratif', stringValue: '' },
      { label: 'Demandeur-Entreprise: Forme juridique', stringValue: '' },
      { label: 'Demandeur-Entreprise: Forme juridique code', stringValue: '' },
      { label: 'Demandeur-Entreprise: Adresse', stringValue: '149 RTE de la Prêle 01150 Sainte-Julie' },
      { label: 'Demandeur-Entreprise: Nom', stringValue: 'BN' },
      { label: 'Demandeur-Entreprise: Nom commercial', stringValue: 'Bibliothéque numérique' },
      { label: 'Demandeur-Entreprise: numero TVA intracommunautaire', stringValue: '' },
      { label: 'Demandeur-Entreprise: Prénom', stringValue: '' },
      { label: 'Demandeur-Entreprise: Raison sociale', stringValue: '' },
      { label: 'Demandeur-Entreprise: Siren', stringValue: '432992584' },
      { label: 'Demandeur-Entreprise: Siret siege social', stringValue: '43299258400016' },
    ]

    const fieldsEntrprise = fields.filter(f => f.label.match(/Demandeur-Entreprise:.*/))
    expect(fieldsEntrprise).toHaveLength(expectedEntreprise.length)
    expectedEntreprise.forEach(expectedValue => {
      expect(fieldsEntrprise.find(f => f.label === expectedValue.label)).toMatchObject(
        expectedValue,
      )
    })
  })
})
