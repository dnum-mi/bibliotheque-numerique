import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'

describe('Dossiers (e2e)', () => {
  let app: INestApplication
  let cookies: Cookies

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('GET /dossiers/:id', () => {
    it('Should be 401', async () => {
      return request(app.getHttpServer()).get('/dossiers/1').expect(401)
    })

    it('Should be 404', async () => {
      return request(app.getHttpServer())
        .get('/dossiers/12547')
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })

    it('Should be 403 for no role', async () => {
      return await request(app.getHttpServer())
        .get('/dossiers/1')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should be 403 for instructor without demarche', async () => {
      return await request(app.getHttpServer())
        .get('/dossiers/13')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should retrieve complete Dossier', async () => {
      return await request(app.getHttpServer())
        .get('/dossiers/11')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body.dsDataJson.annotations).toEqual('I can see you')
          expect(body.dsDataJson.messages).toEqual('Big brother is watching you')
        })
    })

    it('Should retrieve Dossier without annotation and messages', async () => {
      return await request(app.getHttpServer())
        .get('/dossiers/12')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body.dsDataJson.annotations).toEqual([])
          expect(body.dsDataJson.messages).toEqual([])
        })
    })
  })
})
