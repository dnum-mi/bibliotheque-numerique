import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { JwtService } from '@nestjs/jwt'
import { jwtConstants } from '@/modules/auth/objects/constants'
import { faker } from '@faker-js/faker/locale/fr'
import { UserService } from '@/modules/users/providers/user.service'
import { dataSource } from '../data-source-e2e.typeorm'
import { User } from '../../../src/modules/users/objects/user.entity'
import { UpdateProfileDto } from '@/modules/users/objects/dtos/input'

describe('users (e2e)', () => {
  let app: INestApplication
  let mailerService: MailerService
  let userService: UserService
  let cookies: Cookies
  let emailInstructorConnected: string
  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    mailerService = testingModule.mailerService as MailerService
    userService = await app.resolve(UserService)
    cookies = testingModule.cookies
    emailInstructorConnected = testingModule.emailInstructor
  })
  beforeEach(() => {
    jest.spyOn(mailerService, 'sendMail').mockClear()
  })
  afterAll(async () => {
    await app.close()
  })

  describe('POST /users/list', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .post('/users/list')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .post('/users/list')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should return a list of user 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/list')
        .set('Cookie', [cookies.superadmin])
        .send({
          columns: ['firstname', 'lastname'],
        })
        .expect(200)
      expect(response.body).toBeDefined()
      expect(response.body.total).toEqual(5)
      expect(response.body.data).toMatchObject([
        { id: 3, lastname: 'norole', firstname: 'Bill' },
        { id: 4, lastname: 'admin1', firstname: 'Suzette' },
        { id: 5, lastname: 'instructor1', firstname: 'Steve' },
        { id: 6, lastname: 'admin', firstname: 'Jean' },
        { id: 7, lastname: 'norole', firstname: 'Titouan' },
      ])
    })

    it('Should return a list of user 2', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/list')
        .set('Cookie', [cookies.superadmin])
        .send({
          columns: ['firstname', 'lastname'],
          sorts: [{ key: 'firstname', order: 'DESC' }],
          filters: {
            lastname: {
              filterType: 'text',
              condition1: {
                type: 'contains',
                filter: 'admin',
              },
            },
          },
        })
        .expect(200)
      expect(response.body).toBeDefined()
      expect(response.body.data).toEqual([
        { id: 4, lastname: 'admin1', firstname: 'Suzette' },
        { id: 6, lastname: 'admin', firstname: 'Jean' },
      ])
    })

    it('Should return a list of user with role resume', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/list')
        .set('Cookie', [cookies.superadmin])
        .send({
          columns: ['firstname', 'lastname', 'roleLabel', 'roleOptionsResume'],
        })
        .expect(200)
      expect(response.body.data).toMatchObject([
        {
          id: 3,
          lastname: 'norole',
          firstname: 'Bill',
          roleLabel: null,
          roleOptionsResume: '',
        },
        {
          id: 4,
          lastname: 'admin1',
          firstname: 'Suzette',
          roleLabel: 'admin',
          roleOptionsResume: 'ARUP (1), FRUP (1)',
        },
        {
          id: 5,
          lastname: 'instructor1',
          firstname: 'Steve',
          roleLabel: 'instructor',
          roleOptionsResume: 'ARUP (2), FDD (1)',
        },
        {
          id: 6,
          lastname: 'admin',
          firstname: 'Jean',
          roleLabel: null,
          roleOptionsResume: '',
        },
        {
          id: 7,
          lastname: 'norole',
          firstname: 'Titouan',
          roleLabel: null,
          roleOptionsResume: '',
        },
      ])
    })
  })

  describe('POST /users/reset-password', () => {
    it('Should send a mail to reset password with e-mail correct', async () => {
      const email = 'testpwd@localhost.com'
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
        .post('/users/me/reset-password')
        .send({
          email,
        })
      expect(mailerService.sendMail).toBeCalled()
      expect(to).toBe(email)
      expect(subject).toBe('Modifier son mot de passe')
    })

    it('Should no send mail for reset password with e-mail no correct', async () => {
      await request(app.getHttpServer()) //
        .post('/users/me/reset-password')
        .send({
          email: 'nouser@test.com',
        })
      expect(mailerService.sendMail).not.toBeCalled()
    })
  })

  describe('PUT /users/me/password', () => {
    it('Should return 401', async () => {
      await request(app.getHttpServer()) //
        .put('/users/me/password')
        .send({})
        .expect(401)
    })

    it('Should 403 to update password with invalid token', async () => {
      await request(app.getHttpServer()) //
        .put('/users/me/password')
        .send({ token: 'test' })
        .expect(403)
    })

    it('Should 200 to update password ', async () => {
      const oldPassword = await userService.repository
        .findOne({
          where: { id: 2 },
          select: ['password'],
        })
        .then((user) => user.password)
      const jwtService = new JwtService({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1m' },
      })
      const jwt = jwtService.sign({ user: 2 })
      const jwtforurl = Buffer.from(jwt).toString('base64url')

      await request(app.getHttpServer()) //
        .put('/users/me/password')
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
        .put('/users/me/password')
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

    it('Should return 200 if user already exists', async () => {
      const email = 'testpwd@localhost.com'
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

      await request(app.getHttpServer())
        .post('/users')
        .send({
          ...fakeUser,
          password: 'ThisIs1ValidPassword#',
          email,
        })
        .expect(201)

      expect(mailerService.sendMail).toBeCalled()
      expect(to).toBe(email)
      expect(subject).toBe('Déjà inscrit')
    })
  })

  describe('GET and PATCH /users/me', () => {
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

    it('Should return pretty role with demarche name', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            id: 5,
            email: 'instructor1@localhost.com',
            role: {
              label: 'instructor',
              options: {
                1: {

                  national: false,
                  prefectures: ['D75'],
                  demarche: {
                    id: 1,
                    title: 'Déclaration de financement étranger',
                    types: ['ARUP', 'FDD'],
                    dsId: 76,
                  },
                },
                5: {
                  national: false,
                  prefectures: ['D57'],
                  demarche: {
                    id: 5,
                    title:
                      '[UPDATE-IDENTIFICATION] Déclaration de financement étranger',
                    types: ['ARUP'],
                    dsId: 4,
                  },
                },
              },
            },
          })
        })
    })

    it('Should update user connected', async () => {
      const { id, firstname, job } = await dataSource.manager.findOne(User, { where: { email: emailInstructorConnected } })

      const dataToUpdate: UpdateProfileDto = {
        job: 'testeur',
        firstname: 'testPrenom',
      }

      await request(app.getHttpServer())
        .patch('/users/me')
        .send(dataToUpdate)
        .set('Cookie', [cookies.instructor])
        .expect(200)

      const userUpdated = await dataSource.manager.findOne(User, { where: { email: emailInstructorConnected } })
      expect(userUpdated).toMatchObject(dataToUpdate)
      await dataSource.manager.update(User,
        { id }, { firstname, job })
    })
  })
})
