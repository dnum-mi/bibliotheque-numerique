import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { RefreshToken } from '@/modules/refresh-token/refresh-token.entity'
import { AuthService } from '@/modules/auth/providers/auth.service'
import { dataSource } from '../data-source-e2e.typeorm'
import { Repository } from 'typeorm'

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
  let refreshTokenRepository: Repository<RefreshToken>

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    refreshTokenRepository = dataSource.getRepository(RefreshToken)

    authService = app.get(AuthService)

    jest.spyOn(authService, 'fetchProconnectUserInfo').mockResolvedValue({
      email: adminFixtureUser.email,
      access_token: 'mockAccessToken123',
    })
  })

  beforeEach(async () => {
    await refreshTokenRepository.delete({})
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
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'admin1@localhost.com',
          password: 'password',
        })

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body.accessToken).toBeDefined()
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
    it('Should return 200', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/proconnect/callback')
        .expect(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body.accessToken).toBeDefined()
    })

    it('Should throw an error if no email is found in userinfo', async () => {
      jest.spyOn(authService, 'fetchProconnectUserInfo').mockResolvedValue({
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
      jest.spyOn(authService, 'fetchProconnectUserInfo').mockResolvedValue({
        email: 'newuser@localhost.com',
        given_name: 'New',
        family_name: 'User',
        access_token: 'mockAccessToken123',
      })

      const response = await request(app.getHttpServer())
        .post('/auth/proconnect/callback')
        .expect(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body.accessToken).toBeDefined()
    })
  })
})
