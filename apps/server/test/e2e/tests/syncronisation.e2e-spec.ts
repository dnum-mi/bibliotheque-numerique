import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { getAdminCookie } from '../common/get-admin-cookie'
import { dataSource } from '../data-source-e2e.typeorm'
import { Field } from '../../../src/modules/dossiers/objects/entities/field.entity'
import { Dossier } from '../../../src/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'
import { InstructionTime } from '../../../src/plugins/instruction_time/instruction_times/instruction_time.entity'

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
      await dataSource.manager.delete(Field, {})
      await dataSource.manager.query('ALTER SEQUENCE "fields_id_seq" RESTART WITH 1;')
      await dataSource.manager.delete(Demarche, { id: 42 })
      await dataSource.manager.delete(InstructionTime, {
        dossier: dossier.id,
      })
      await dataSource.manager.delete(Dossier, {
        id: dossier.id,
      })
      await dataSource.manager.query('ALTER SEQUENCE "dossiers_id_seq" RESTART WITH 1;')
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
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          message: 'Demarche with DS id 42 has been created.',
        })
        return dataSource.manager.find(Field, {})
      })
      .then((fields) => {
        expect(fields.length).toEqual(8)
        expect(fields).toMatchObject([
          {
            id: 1,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA0Mw==',
            stringValue: "C'est du chocolat.",
            parentId: null,
            parentRowIndex: null,
            label: 'Informations relatives au bénéficiaire du financement',
            dossierId: 1,
          },
          {
            id: 2,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA0NQ==',
            stringValue: 'W123456789',
            parentId: null,
            parentRowIndex: null,
            label: "Saisir le n°RNA de l'association",
            dossierId: 1,
          },
          {
            id: 3,
            fieldSource: 'champs',
            dsChampType: 'RepetitionChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA2NQ==',
            stringValue: '',
            parentId: null,
            parentRowIndex: null,
            label: 'Liste de course',
            dossierId: 1,
          },
          {
            id: 4,
            fieldSource: 'dossier',
            dsChampType: null,
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: null,
            stringValue: 'en_construction',
            parentId: null,
            parentRowIndex: null,
            label: 'state',
            rawJson: null,
            dossierId: 1,
          },
          {
            id: 5,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA2Nnww',
            stringValue: 'Fraise',
            parentId: 3,
            parentRowIndex: 0,
            label: 'Fruit',
            dossierId: 1,
          },
          {
            id: 6,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA2N3ww',
            stringValue: 'Oignon',
            parentId: 3,
            parentRowIndex: 0,
            label: 'Légume',
            dossierId: 1,
          },
          {
            id: 7,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA2Nnww',
            stringValue: 'Framboise',
            parentId: 3,
            parentRowIndex: 1,
            label: 'Fruit',
            dossierId: 1,
          },
          {
            id: 8,
            fieldSource: 'champs',
            dsChampType: 'TextChamp',
            type: 'string',
            formatFunctionRef: null,
            dsFieldId: 'Q2hhbXAtMTA2N3ww',
            stringValue: 'Poivron',
            parentId: 3,
            parentRowIndex: 1,
            label: 'Légume',
            dossierId: 1,
          },
        ])
      })
  })
})
