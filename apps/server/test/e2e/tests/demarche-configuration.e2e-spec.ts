import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { getAdminCookie } from '../common/get-admin-cookie'
import { dataSource } from '../data-source-e2e.typeorm'

describe('Configuration ', () => {
  let app: INestApplication
  let cookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app

    cookie = await getAdminCookie(app)
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('GET - Should return 403 on configurations', async () => {
    return request(app.getHttpServer()).get('/demarches/1/configurations').expect(403)
  })

  it('GET - Should return 404 on configurations', async () => {
    return request(app.getHttpServer()).get('/demarches/8765/configurations').set('Cookie', [cookie]).expect(404)
  })

  it('GET - Should return 200 and configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/configurations')
      .set('Cookie', [cookie])
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual([
          {
            id: '01',
            type: 'string',
            columnLabel: null,
            originalLabel: 'Title',
            formatFunctionRef: null,
          },
          {
            id: '02',
            type: 'string',
            columnLabel: 'already a custom label',
            originalLabel: 'state',
            formatFunctionRef: 'state',
          },
        ])
      })
  })

  it('Patch /:fieldId - Should return 400', async () => {
    return request(app.getHttpServer()).patch('/demarches/2/configurations/01').set('Cookie', [cookie]).send({
      columnLabel: 456,
    }).expect(400)
  })

  it('Patch /:fieldId - Should return 400', async () => {
    return request(app.getHttpServer()).patch('/demarches/2/configurations/01').set('Cookie', [cookie])
      .expect(200)
  })

  it('Patch /:fieldId - Should change label of field', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/configurations/01')
      .set('Cookie', [cookie])
      .send({
        columnLabel: 'new label',
      })
      .expect(200)
      .then(() => {
        return request(app.getHttpServer())
          .get('/demarches/2/configurations')
          .set('Cookie', [cookie])
          .expect(200)
      })
      .then(({ body }) => {
        expect(body).toEqual([
          {
            id: '01',
            type: 'string',
            columnLabel: 'new label',
            originalLabel: 'Title',
            formatFunctionRef: null,
          },
          {
            id: '02',
            type: 'string',
            columnLabel: 'already a custom label',
            originalLabel: 'state',
            formatFunctionRef: 'state',
          },
        ])
      })
  })
})
