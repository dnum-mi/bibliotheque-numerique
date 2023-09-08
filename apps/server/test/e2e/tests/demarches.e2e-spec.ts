import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { getUserCookie } from '../common/get-user-cookie'
import { getAdminCookie } from '../common/get-admin-cookie'

describe('Demarches (e2e)', () => {
  let app: INestApplication
  let adminCookie: string
  let userCookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    userCookie = await getUserCookie(app, 'test.demarche.2@localhost.com')
    adminCookie = await getAdminCookie(app)
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it('should have one demarche 2 ', async () => {
    const { body } = await request(app.getHttpServer()).get('/demarches').set('Cookie', [userCookie]).expect(200)
    expect(body).toHaveLength(1)
    expect(body[0]).toHaveProperty('id', 3)
  })

  it('Get small should only be accessible for admin', async () => {
    return request(app.getHttpServer())
      .get('/demarches/small')
      .set('Cookie', [userCookie])
      .expect(403)
  })

  it('Get small should return only title and id', async () => {
    return request(app.getHttpServer())
      .get('/demarches/small')
      .set('Cookie', [adminCookie])
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toBeGreaterThan(0)
        body.forEach(d => {
          expect(Object.keys(d)).toEqual(['id', 'title', 'dsId'])
        })
      })
  })
})
