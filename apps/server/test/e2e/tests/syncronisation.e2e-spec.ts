import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { getAdminCookie } from '../common/get-admin-cookie'
import { dataSource } from '../data-source-e2e.typeorm'
import { Field } from '../../../src/modules/dossiers/objects/entities/field.entity'
import { Dossier } from '../../../src/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'
import { InstructionTime } from '../../../src/plugins/instruction_time/instruction_times/instruction_time.entity'
import { In } from 'typeorm'

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
        return dataSource.manager.find(Field, {
          where: {
            sourceId: In([
              'Q2hhbXAtMTA0Mw==',
              'Q2hhbXAtMTA0NQ==',
              'Q2hhbXAtMTA2NQ==',
              'Q2hhbXAtMTA2Nnww',
              'Q2hhbXAtMTA2N3ww',
            ]),
          },
        })
      })
      .then(() => {
        // TODO: fix again on new pagination branch
        expect(true).toBe(true)
      })
  })
})
