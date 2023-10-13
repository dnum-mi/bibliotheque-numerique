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
    parentRowIndex: 1,
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
    parentRowIndex: 0,
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
    parentRowIndex: 0,
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
    parentRowIndex: 1,
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
    parentRowIndex: 1,
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
    parentRowIndex: 0,
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
    parentRowIndex: 1,
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
    parentRowIndex: 0,
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

describe('Syncronisation ', () => {
  let app: INestApplication
  let cookies: Cookies
  let fileService: FileService
  let organismeService: OrganismeService
  let dossierService: DossierService
  let fieldService: FieldService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    fileService = testingModule.fileService as FileService
    organismeService = await app.resolve(OrganismeService)
    dossierService = await app.resolve(DossierService)
    fieldService = await app.resolve(FieldService)
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
        const demarche = await dataSource.manager
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
        expect(fields.length).toEqual(40)
        expect(fields).toMatchObject([
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
            formatFunctionRef: null,
            stringValue: 'Unknown',
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
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            sourceId: 'Q2hhbXAtMTA0Mw==',
            stringValue: "C'est du chocolat.",
            dateValue: null,
            numberValue: null,
            parentId: null,
            parentRowIndex: null,
            label: 'Informations relatives au bénéficiaire du financement',
          },
          {
            fieldSource: 'champs',
            dsChampType: 'RnaChamp',
            type: 'string',
            formatFunctionRef: 'rna',
            sourceId: 'Q2hhbXAtMTA0NQ==',
            stringValue: 'W123456789',
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
        ])
        expect(fields[26].parentId).toEqual(fields[30].id)
        expect(fields[27].parentId).toEqual(fields[30].id)
        expect(fields[28].parentId).toEqual(fields[30].id)
        expect(fields[29].parentId).toEqual(fields[30].id)

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
      })
  })
})
