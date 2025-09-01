import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import { UserService } from '@/modules/users/providers/user.service'
import { IRole, Roles } from '@biblio-num/shared'
import { UpdateOneRoleOptionDto } from '@/modules/users/objects/dtos/input'

describe('users (e2e)', () => {
  let app: INestApplication
  let userService: UserService
  let tokens: Tokens
  let user5OriginalRole: IRole

  const resetUser5 = async (): Promise<void> => {
    await userService.repository.update({ id: 5 }, { role: user5OriginalRole })
  }

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    userService = await app.resolve(UserService)
    tokens = testingModule.tokens
    user5OriginalRole = (await userService.findOneById(5)).role
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /users/:targetUserId/role', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .get('/users/1/role')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .get('/users/1/role')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return correct user with editable role', async () => {
      const response = await request(app.getHttpServer()) //
        .get('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .expect(200)
      expect(response.body).toMatchObject({
        originalUser: {
          id: 5,
          email: 'instructor1@localhost.com',
          lastname: 'instructor1',
          firstname: 'Steve',
        },
        demarcheHash: {
          1: {
            id: 1,
            title: 'Déclaration de FE',
            dsId: 76,
            checked: true,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: ['D75'], deletable: [], addable: [] },
            },
          },
          2: {
            id: 2,
            title: 'Démarche de test pour les configurations',
            dsId: 77,
            checked: false,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: [], deletable: [], addable: [] },
            },
          },
          3: {
            id: 3,
            title: 'Déclaration de FE',
            dsId: 2,
            checked: false,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: [], deletable: [], addable: [] },
            },
          },
          4: {
            id: 4,
            title: 'Déclaration de FE',
            dsId: 3,
            checked: false,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: [], deletable: [], addable: [] },
            },
          },
          5: {
            id: 5,
            title:
              '[UPDATE-IDENTIFICATION] Déclaration de FE',
            dsId: 4,
            checked: true,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: ['D57'], deletable: [], addable: [] },
            },
          },
          6: {
            id: 6,
            title:
              '[DELETE-IDENTIFICATION] Déclaration de FE',
            dsId: 5,
            checked: false,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: [], deletable: [], addable: [] },
            },
          },
          7: {
            id: 7,
            title:
              '[UNDEFINED-IDENTIFICATION] Déclaration de FE',
            dsId: 6,
            checked: false,
            editable: true,
            prefectureOptions: {
              national: { value: false, editable: true },
              prefectures: { value: [], deletable: [], addable: [] },
            },
          },
        },
      })
    })
  })

  describe('PATCH /users/:targetUserId/role', () => {
    afterEach(async () => {
      await resetUser5()
    })

    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/1/role')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/1/role')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return 400', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 'toto',
          checked: false,
        })
        .expect(400)
    })

    it('Should patch user role: unchecked demarche', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 1,
          checked: false,
        })
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[1]).toBeUndefined()
    })

    it('Should patch user role: check demarche', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 3,
          checked: true,
        })
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[3]).toEqual({
        national: false,
        prefectures: [],
      })
    })

    it('Should patch user role: check many demarches', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role/many')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send([{
          demarcheId: '3',
          checked: true,
        }, {
          demarcheId: '4',
          checked: true,
        }, {
          demarcheId: '6',
          checked: true,
        }])
        .expect(200)

      const user = await userService.findOneById(5)
      expect(user.role.options).toEqual({
        ...user.role.options,
        3: {
          national: false,
          prefectures: [],
        },
        4: {
          national: false,
          prefectures: [],
        },
        6: {
          national: false,
          prefectures: [],
        },
      })
    })

    it('Should patch user role: check national', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)

        .send({
          demarcheId: 1,
          national: true,
        })
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[1]).toEqual({
        national: true,
        prefectures: [],
      })
    })

    it('Should patch user role: uncheck national', async () => {
      await userService.repository.update(
        { id: 5 },
        {
          role: {
            label: 'instructor',
            options: {
              1: {
                national: false,
                prefectures: ['D75'],
              },
              2: {
                national: true,
                prefectures: [],
              },
              5: {
                national: false,
                prefectures: ['D57'],
              },
            },
          },
        },
      )
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 2,
          national: false,
        })
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[2]).toEqual({
        national: false,
        prefectures: [],
      })
    })

    it('Should patch user role: add prefecture', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 1,
          prefecture: {
            toAdd: true,
            key: 'D30',
          },
        } as UpdateOneRoleOptionDto)
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[1]).toEqual({
        national: false,
        prefectures: ['D75', 'D30'],
      })
    })

    it('Should patch user role: delete prefecture', async () => {
      await request(app.getHttpServer()) //
        .patch('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          demarcheId: 1,
          prefecture: {
            toAdd: false,
            key: 'D75',
          },
        } as UpdateOneRoleOptionDto)
        .expect(200)
      const user = await userService.findOneById(5)
      expect(user.role.options[1]).toEqual({
        national: false,
        prefectures: [],
      })
    })
  })

  describe('PUT /users/:targetUserId/role', () => {
    afterEach(async () => {
      await resetUser5()
    })

    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .put('/users/1/role')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .put('/users/1/role')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return 200', async () => {
      await request(app.getHttpServer()) //
        .put('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          role: Roles.superadmin,
        })
        .expect(200)
      expect((await userService.findOneById(5)).role).toEqual({
        label: Roles.superadmin,
        options: {},
      })
    })

    it('Should return 200', async () => {
      await request(app.getHttpServer()) //
        .put('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({
          role: Roles.admin,
        })
        .expect(200)
      expect((await userService.findOneById(5)).role).toEqual({
        label: Roles.admin,
        options: user5OriginalRole.options,
      })
    })
  })

  describe('DELETE /users/:targetUserId/role', () => {
    afterEach(resetUser5)

    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .delete('/users/1/role')
        .expect(401)
    })

    it('Should return 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .delete('/users/1/role')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return 200', async () => {
      await request(app.getHttpServer()) //
        .delete('/users/5/role')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .expect(200)
      expect((await userService.findOneById(5)).role).toEqual({
        label: null,
        options: {},
      })
    })
  })
})
