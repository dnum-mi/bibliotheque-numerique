import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { getUserCookie } from '../common/get-user-cookie'

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

  it('should have one demarche 2 ', async () => {
    const cookie = await getUserCookie(app, 'test.demarche.2@localhost.com')
    const { body } = await request(app.getHttpServer()).get('/demarches').set('Cookie', [cookie]).expect(200)
    expect(body).toHaveLength(1)
    expect(body[0]).toHaveProperty('id', 3)
  })
})
