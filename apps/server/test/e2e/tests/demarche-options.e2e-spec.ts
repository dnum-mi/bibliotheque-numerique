import { INestApplication } from '@nestjs/common'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'

describe('Option ', () => {
  let app: INestApplication
  let cookies: Cookies
  let demarcheService: DemarcheService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    demarcheService = await testingModule.app.resolve(DemarcheService)
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  it('GET - Should return 401 on options', async () => {
    return request(app.getHttpServer()).get('/demarches/1/options').expect(401)
  })

  it('GET - Should return 403 for instructor', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/options')
      .set('Cookie', [cookies.instructor])
      .expect(403)
  })

  it('GET - Should return 403 on admin to other demarche', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/options')
      .set('Cookie', [cookies.admin])
      .expect(403)
  })

  it('GET - Should return 404 on configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/8765/options')
      .set('Cookie', [cookies.superadmin])
      .expect(404)
  })

  it('GET - Should return 200 and configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/options')
      .set('Cookie', [cookies.admin])
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          nbrMonthAnonymisation: null,
          anonymizationEvent: 'DepotDate',
          isOnAllDossiersOfOrganisme: false,
        })
      })
  })

  it('Patch - Should return 400', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options')
      .set('Cookie', [cookies.admin])
      .send({
        truc: 456,
      })
      .expect(400)
  })

  it('Patch nbrMonth - Should return 200', async () => {
    await request(app.getHttpServer())
      .patch('/demarches/2/options')
      .set('Cookie', [cookies.admin])
      .send({
        nbrMonthAnonymisation: 12,
      })
      .expect(200)
    const d = await demarcheService.findOneById(2)
    expect(d.nbrMonthAnonymisation).toBe(12)
  })
})
