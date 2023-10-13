import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { TestingModuleFactory } from '../common/testing-module.factory'

const adminFixtureUser = {
  id: 4,
  email: 'admin1@localhost.com',
  lastname: '',
  firstname: '',
  role: { key: 'admin', options: [] },
}

describe('Auth (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('POST /auth/sign-in', () => {
    it('Should return 404 on bad sign_in', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'toto',
          password: 'toto',
        })
        .expect(404)
    })

    it('Should return 404 on bad password', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'admin@localhost.com',
          password: 'badpassword',
        })
        .expect(404)
    })

    it('Should return 200 on connection', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'admin1@localhost.com',
          password: 'password',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            email: adminFixtureUser.email,
            id: adminFixtureUser.id,
          })
        })
    })

    it('Should return 404 on user no valid', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'test.no.valid@localhost.com',
          password: 'password',
        })
        .expect(404)
    })
  })

  describe('DELETE /auth', () => {
    it('Should return 200 on disconnection', async () => {
      await request(app.getHttpServer()) //
        .delete('/auth')
        .expect(200)
    })
  })
})
