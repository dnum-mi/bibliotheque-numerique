import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { getAdminCookie } from '../common/get-admin-cookie'
import { dataSource } from '../data-source-e2e.typeorm'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { InstructionTime } from '@/plugins/instruction_time/instruction_times/instruction_time.entity'

import * as dayjs from 'dayjs'

const expectedFixFieldsDates = (dossierId,
  dateDepot = null,
  datePassageEnInstruction = null,
  datePassageEnConstruction = null)
  :Partial<Field>[] => ([
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
    stringValue: dateDepot ? dayjs(datePassageEnConstruction).toISOString() : '',
    dateValue: dateDepot ? dayjs(datePassageEnConstruction).toDate() : null,
    numberValue: null,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
])

describe('Syncronisation ', () => {
  let app: INestApplication
  let cookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app

    cookie = await getAdminCookie(app)
    const dossier = await dataSource.manager.findOne(Dossier, {
      where: { sourceId: '142' },
      select: ['id'],
    })
    if (dossier) {
      // while watching test, fixture are not reloaded, we reset data manually
      await dataSource.manager.delete(Field, { dossier: { id: dossier.id } })
      await dataSource.manager.delete(InstructionTime, {
        dossier: dossier.id,
      })
      await dataSource.manager.delete(Dossier, {
        id: dossier.id,
      })
      const demarche = await dataSource.manager
        .createQueryBuilder(Demarche, 'd')
        .where('d."dsDataJson"->>\'number\' = :id', { id: '42' })
        .select('d.id')
        .getOne()
      await dataSource.manager.delete(Demarche, { id: demarche.id })
    }
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('Should return 403 on synchro_dossier', async () => {
    return (
      request(app.getHttpServer())
        // @ts-ignore The property 'post' really exists
        .post('/demarches/synchro-dossiers')
        .send({
          id: 29,
        })
        .expect(403)
    )
  })

  it('Should return 404 on wrong demarche id', async () => {
    return (
      request(app.getHttpServer())
        // @ts-ignore The property 'post' really exists
        .post('/demarches/synchro-dossiers')
        .set('Cookie', [cookie])
        .send({
          idDs: 404,
        })
        .expect(404)
    )
  })

  it('should syncronise one dossier of one demarche and create associated fields', async () => {
    return request(app.getHttpServer())
      .post('/demarches/create')
      .set('Cookie', [cookie])
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
            expect.objectContaining(
              {
                id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
              },
            ),
            expect.objectContaining(
              {
                id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
              },
            ),
          ],
          ),
        )

        expect(demarche.mappingColumns).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining(
              {
                id: 'Q2hhbXAtMTExMA==',
                type: 'date',
                source: 'annotation',
              },
            )],
          ))
        return dataSource.manager.find(Field, {
          where: { dossier: { demarcheId: demarche.id, sourceId: '142' } },
          order: { sourceId: 'ASC', stringValue: 'ASC' },
        })
      })
      .then((fields) => {
        expect(fields.length).toEqual(20)
        expect(fields).toMatchObject([
          {
            fieldSource: 'fix-field',
            dsChampType: null,
            type: 'string',
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
          ...expectedFixFieldsDates(42),
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
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
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
        expect(fields[7].parentId).toEqual(fields[11].id)
        expect(fields[8].parentId).toEqual(fields[11].id)
        expect(fields[9].parentId).toEqual(fields[11].id)
        expect(fields[10].parentId).toEqual(fields[11].id)

        expect(fields).toEqual(
          expect.not.arrayContaining([
            expect.objectContaining(
              {
                sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
              },
            ),
            expect.objectContaining(
              {
                sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
              },
            ),
          ],
          ),
        )
      })
      .then(() => {
        return dataSource.manager.find(Field, {
          where: { dossier: { sourceId: '143' } },
          order: { sourceId: 'ASC', stringValue: 'ASC' },
        })
      })
      .then((fields) => {
        console.log(JSON.stringify(fields))
        expect(fields).toMatchObject(
          expect.arrayContaining([
            expect.objectContaining(
              {
                fieldSource: 'annotation',
                dsChampType: 'DateChamp',
                type: 'date',
                sourceId: 'Q2hhbXAtMTEwOQ==',
                dateValue: dayjs().subtract(7, 'days').startOf('day').toDate(),
              },
            ),
          ]))

        expect(fields).toMatchObject(
          expect.arrayContaining([

            expect.objectContaining(
              {
                fieldSource: 'annotation',
                dsChampType: 'DateChamp',
                type: 'date',
                sourceId: 'Q2hhbXAtMTExMA==',
                dateValue: dayjs().subtract(2, 'days').startOf('day').toDate(),
              }),
          ]))

        expect(fields).toMatchObject(
          expect.arrayContaining([

            expect.objectContaining(
              {
                fieldSource: 'annotation',
                dsChampType: 'DateChamp',
                type: 'date',
                sourceId: 'Q2hhbXAtMTExMQ==',
              }),
          ]))

        expect(fields).toMatchObject(
          expect.arrayContaining([

            expect.objectContaining(
              {
                fieldSource: 'annotation',
                dsChampType: 'DateChamp',
                type: 'date',
                sourceId: 'Q2hhbXAtMTExNA==',
              }),
          ]))

        expect(fields).toEqual(
          expect.arrayContaining([
            expect.objectContaining(
              {
                sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
                stringValue: 'IN_PROGRESS',
              },
            ),
            expect.objectContaining(
              {
                sourceId: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
                // 60 - (aujourd'hui - la date de reception de la 2eme demande)
                numberValue: 58,
              },
            ),
          ],
          ),
        )
      })
  })
})
