import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { AuthService } from '@/modules/auth/providers/auth.service'
import { dataSource } from '../data-source-e2e.typeorm'

const adminFixtureUser = {
  id: 4,
  email: 'admin1@localhost.com',
  lastname: '',
  firstname: '',
  role: { label: 'admin', options: { 2: { national: false, prefectures: ['D75'] } } },
}

describe('Auth (e2e)', () => {
  let app: INestApplication
  let authService: AuthService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app

    authService = app.get(AuthService)

    jest.spyOn(authService, 'fetchUserinfo').mockResolvedValue({
      email: adminFixtureUser.email,
      access_token: 'mockAccessToken123',
    })
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
          email: 'testpwd@localhost.com',
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
          expect(body).toMatchObject({
            email: adminFixtureUser.email,
            id: adminFixtureUser.id,
            role: adminFixtureUser.role,
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
      await request(app.getHttpServer())
        .delete('/auth')
        .expect(200)
    })
  })

  describe('GET /auth/proconnect', () => {
    it('Should return 200 and the proconnect URL', async () => {
      await request(app.getHttpServer())
        .get('/auth/proconnect')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('url')
          expect(body.url).toBeTruthy()
        })
    })
  })

  describe('POST /auth/proconnect/callback', () => {
    it('Should return 200 and the user info on callback', async () => {
      await request(app.getHttpServer())
        .post('/auth/proconnect/callback')
        .expect(201)
        .expect(({ body }) => {
          expect(body.email).toBe(adminFixtureUser.email)
        })
    })

    it('Should throw an error if no email is found in userinfo', async () => {
      jest.spyOn(authService, 'fetchUserinfo').mockResolvedValue({
        given_name: 'New',
        family_name: 'User',
        access_token: 'mockAccessToken123',
      })

      await request(app.getHttpServer())
        .post('/auth/proconnect/callback')
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toBe('Email not provided')
        })
    })

    it('Should create a new user when user does not exist', async () => {
      jest.spyOn(authService, 'fetchUserinfo').mockResolvedValue({
        email: 'newuser@localhost.com',
        given_name: 'New',
        family_name: 'User',
        access_token: 'mockAccessToken123',
      })

      await request(app.getHttpServer())
        .post('/auth/proconnect/callback')
        .expect(201)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            email: 'newuser@localhost.com',
            firstname: 'New',
            lastname: 'User',
            job: '',
          })
        })
    })
  })
})
