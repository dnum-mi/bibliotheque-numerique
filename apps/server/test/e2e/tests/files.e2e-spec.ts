import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'

const fileUuid = 'bfa978f1-7337-49df-ae97-40d358afe5b9'

describe('file-storage (e2e)', () => {
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
  })

  describe('GET /files/:uuid', () => {
    it('Should return 401', async () => {
      return request(app.getHttpServer())
        .get('/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
        .expect(401)
    })

    it('Should return 400 if not uuid', async () => {
      return request(app.getHttpServer())
        .get('/files/coucou')
        .set('Cookie', [cookies.instructor])
        .expect(400)
    })

    it('Should return 404 if file not found', async () => {
      return request(app.getHttpServer())
        .get('/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })

    it('Should download file', async () => {
      const response = await request(app.getHttpServer())
        .get(`/files/${fileUuid}`)
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .expect('Content-Disposition', 'attachment; filename="coucou.doc"')

      expect(response.text).toEqual('coucou super test\n')
    })
  })
})
