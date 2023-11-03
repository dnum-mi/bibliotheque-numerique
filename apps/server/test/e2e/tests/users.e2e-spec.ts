import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { JwtService } from '@nestjs/jwt'
import { jwtConstants } from '@/modules/auth/objects/constants'
import { faker } from '@faker-js/faker/locale/fr'
import { UsersService } from '@/modules/users/providers/users.service'

describe('users (e2e)', () => {
  let app: INestApplication
  let mailerService: MailerService
  let userService: UsersService
  let cookies: Cookies

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    mailerService = testingModule.mailerService as MailerService
    userService = await app.resolve(UsersService)
    cookies = testingModule.cookies
  })

  beforeEach(() => {
    jest.spyOn(mailerService, 'sendMail').mockClear()
  })
  afterAll(async () => {
    await app.close()
  })

  describe(' GET /users', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .get('/users')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .get('/users')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should return all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', [cookies.superadmin])
        .expect(200)
      expect(response.body).toBeDefined()
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0].id).toBeDefined()
      expect(response.body[0].email).toBeDefined()
      expect(response.body[0].password).toBeUndefined()
    })
  })

  describe('GET /users/:id', () => {
    it('Should return 401', async () => {
      return request(app.getHttpServer()).get('/users/2').expect(401)
    })

    it('Should return 403 for instructor', async () => {
      return request(app.getHttpServer())
        .get('/users/2')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should return the user', async () => {
      const id = 2
      const response = await request(app.getHttpServer())
        .get(`/users/${id}`)
        .set('Cookie', [cookies.superadmin])
        .expect(200)
      expect(response.body).toBeDefined()
      expect(response.body.id).toBe(id)
      expect(response.body.email).toBeDefined()
      expect(response.body.password).toBeUndefined()
    })

    it('Should return error 404 if the user is not found', async () => {
      const id = 999
      await request(app.getHttpServer()) //
        .get(`/users/${id}`)
        .set('Cookie', [cookies.superadmin])
        .expect(404)
    })

    it('Should return error 400 if user id is not a number', async () => {
      const id = 'test'
      await request(app.getHttpServer()) //
        .get(`/users/${id}`)
        .set('Cookie', [cookies.superadmin])
        .expect(400)
    })
  })

  describe('POST /users/reset-password', () => {
    it('Should send a mail to reset password with e-mail correct', async () => {
      const email = 'admin@localhost.com'
      let to: string
      let subject: string
      jest
        .spyOn(mailerService, 'sendMail')
        .mockImplementation(
          (sendMailOptions: ISendMailOptions): Promise<void> => {
            expect(sendMailOptions).toBeDefined()
            to = sendMailOptions.to as string
            subject = sendMailOptions.subject
            return // eslint-disable-line no-useless-return
          },
        )
      await request(app.getHttpServer()) //
        .post('/users/reset-password')
        .send({
          email,
        })
      expect(mailerService.sendMail).toBeCalled()
      expect(to).toBe(email)
      expect(subject).toBe('Modifier son mot de passe')
    })

    it('Should no send mail for reset password with e-mail no correct', async () => {
      await request(app.getHttpServer()) //
        .post('/users/reset-password')
        .send({
          email: 'nouser@test.com',
        })
      expect(mailerService.sendMail).not.toBeCalled()
    })
  })

  describe('PUT /users', () => {
    it('Should return 401', async () => {
      await request(app.getHttpServer()) //
        .put('/users')
        .send({})
        .expect(401)
    })

    it('Should 403 to update password with invalide token', async () => {
      await request(app.getHttpServer()) //
        .put('/users')
        .send({ token: 'test' })
        .expect(403)
    })

    it('Should 200 to update password ', async () => {
      const oldPassword = await userService.repository.findOne({ where: { id: 2 }, select: ['password'] }).then((user) => user.password)
      const jwtService = new JwtService({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1m' },
      })
      const jwt = jwtService.sign({ user: 2 })
      const jwtforurl = Buffer.from(jwt).toString('base64url')

      await request(app.getHttpServer()) //
        .put('/users')
        .send({
          password: 'Y,cqu;CQ.5]BcD3',
          token: jwtforurl,
        })
        .expect(200)
      await userService.repository.update({ id: 2 }, { password: oldPassword })
    })

    it('Should 400 to update password without password', async () => {
      const jwtService = new JwtService({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1m' },
      })
      const jwt = jwtService.sign({ user: 2 })
      const jwtforurl = Buffer.from(jwt).toString('base64url')

      await request(app.getHttpServer()) //
        .put('/users')
        .send({
          token: jwtforurl,
        })
        .expect(400)
    })
  })

  describe('POST /users', () => {
    const fakeUser = {
      email: faker.internet.email(),
      lastname: 'De la jungle',
      firstname: 'George',
      job: 'King',
    }

    it('Should return error 400 if email is not valid', async () => {
      const email = 'test'
      const password = 'ThisIs1ValidPassword#'
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email,
          password,
        })
        .expect(400)
    })

    it('Should return error 400 if password is not valid', async () => {
      const email = 'test2@bn.fr'
      const password = 'test'
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email,
          password,
        })
        .expect(400)
    })

    it('Should create a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          ...fakeUser,
          password: 'ThisIs1ValidPassword#',
        })
        .expect(201)
      expect(response.body).toMatchObject(fakeUser)
      await userService.repository.delete({ email: fakeUser.email })
    })

    it('Should return error 409 if user already exists', async () => {
      const email = 'admin@localhost.com'
      await request(app.getHttpServer())
        .post('/users')
        .send({
          ...fakeUser,
          password: 'ThisIs1ValidPassword#',
          email,
        })
        .expect(409)
    })
  })

  describe('GET /users/me', () => {
    it('Should return 401 if user is not connected', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401)
    })

    it('Should return 200 if user is connected', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', [cookies.admin])
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            email: 'admin1@localhost.com',
          })
        })
    })
  })
})
