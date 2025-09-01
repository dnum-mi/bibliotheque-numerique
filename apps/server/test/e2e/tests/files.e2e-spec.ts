import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import { HubService } from '../../../src/modules/hub/providers/hub.service'
import { mockStream } from '../../mock/s3-service/s3-service.mock'

const fileUuid = 'bfa978f1-7337-49df-ae97-40d358afe5b9'

describe('file-storage (e2e)', () => {
  let app: INestApplication
  let tokens: Tokens
  let hubService: HubService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    tokens = testingModule.tokens
    hubService = app.get(HubService)
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
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(400)
    })

    it('Should return 404 if file not found', async () => {
      return request(app.getHttpServer())
        .get('/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)
    })

    it('Should download file', async () => {
      const response = await request(app.getHttpServer())
        .get(`/files/${fileUuid}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .expect('Content-Disposition', 'attachment; filename="coucou.doc"')
      expect(response.text).toEqual('coucou super test\n')
    })

    it('Should download file from hub', async () => {
      jest.spyOn(hubService, '_getFileToStream')
        .mockImplementation(async (id: string, uuid: string, pathRoot: string) => {
          console.log({ id, uuid, pathRoot })
          return mockStream('hub.txt')
        })
      const response = await request(app.getHttpServer())
        .get('/files/bfa978f1-7337-49df-ae97-40d358afe5c0')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .expect('Content-Disposition', 'attachment; filename="yo.doc"')
      expect(response.text).toEqual('from hub\n')
    })
  })
})
