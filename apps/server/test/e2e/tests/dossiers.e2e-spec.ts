import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { loggerServiceMock } from '../../mock/logger-service.mock'

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
      return request(await app.getHttpServer())
        .get('/dossiers/1')
        .expect(401)
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
      loggerServiceMock.setContext = jest
        .fn()
        .mockImplementation(() =>
          console.log('Should retrieve complete Dossier'),
        )
      loggerServiceMock.error = jest
        .fn()
        .mockImplementation((e) => console.log(e))
      return await request(app.getHttpServer())
        .get('/dossiers/11')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body.dsDataJson.annotations).toEqual('I can see you')
          expect(body.dsDataJson.messages).toEqual(
            'Big brother is watching you',
          )
        })
        .finally(() => {
          loggerServiceMock.setContext = jest.fn()
          loggerServiceMock.error = jest.fn()
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

  describe('GET /dossiers/:id/files', () => {
    it('Should be 401', async () => {
      return request(app.getHttpServer())
        .post('/dossiers/16/files/list')
        .expect(401)
    })

    it('Should be 403 for no role', async () => {
      return await request(app.getHttpServer())
        .post('/dossiers/16/files/list')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should return all file for admin', async () => {
      return await request(app.getHttpServer())
        .post('/dossiers/16/files/list')
        .set('Cookie', [cookies.superadmin])
        .send({
          limit: 10,
          page: 1,
          columns: ['id', 'label', 'tag'],
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: [
              { id: 2, label: 'coucou', tag: 'some-tag' },
              { id: 3, label: 'salut', tag: 'some-other-tag' },
              { id: 4, label: 'hi', tag: 'some-third-tag' },
            ],
            total: 3,
          })
        })
    })

    it('Should filter tag', async () => {
      return await request(app.getHttpServer())
        .post('/dossiers/16/files/list')
        .set('Cookie', [cookies.superadmin])
        .send({
          limit: 10,
          page: 1,
          filters: {
            tag: {
              filterType: 'set',
              condition1: {
                filter: ['some-third-tag'],
              },
            },
          },
          columns: ['id', 'label', 'tag'],
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: [{ id: 4, label: 'hi', tag: 'some-third-tag' }],
            total: 1,
          })
        })
    })

    it('Should hide file from annotation and message', async () => {
      return await request(app.getHttpServer())
        .post('/dossiers/16/files/list')
        // instructor has no rights on pref 57 for demarche 1, and dossier with id 16 is pref 57 for demarche 1
        .set('Cookie', [cookies.instructor])
        .send({
          limit: 10,
          page: 1,
          columns: ['id', 'label', 'tag'],
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: [{ id: 2, label: 'coucou', tag: 'some-tag' }],
            total: 1,
          })
        })
    })
  })

  describe('GET /dossiers/:id/files/summary', () => {
    const url = '/dossiers/16/files/summary'
    it('Should be 401', async () => {
      return request(app.getHttpServer())
        .get(url)
        .expect(401)
    })

    it('Should be 403 for no role', async () => {
      return await request(app.getHttpServer())
        .get(url)
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should return total of files of dossiers for admin', async () => {
      return await request(app.getHttpServer())
        .get(url)
        .set('Cookie', [cookies.superadmin])
        .expect(200)
        .then(({ text }) => {
          expect(text).toEqual('3')
        })
    })

    it('Should return total files which are not from annotation and message', async () => {
      return await request(app.getHttpServer())
        .get(url)
        // instructor has no rights on pref 57 for demarche 1, and dossier with id 16 is pref 57 for demarche 1
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ text }) => {
          expect(text).toEqual('1')
        })
    })
  })
})
