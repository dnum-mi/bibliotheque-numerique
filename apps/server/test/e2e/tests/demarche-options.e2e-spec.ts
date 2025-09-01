import { INestApplication } from '@nestjs/common'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'

describe('Option ', () => {
  let app: INestApplication
  let tokens: Tokens
  let demarcheService: DemarcheService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    demarcheService = await testingModule.app.resolve(DemarcheService)
    tokens = testingModule.tokens
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
      .set('Authorization', `Bearer ${tokens.instructor}`)
      .expect(403)
  })

  it('GET - Should return 403 on admin to other demarche', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/options')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(403)
  })

  it('GET - Should return 404 on configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/8765/options')
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .expect(404)
  })

  it('GET - Should return 200 and configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/options')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({
          nbrMonthAnonymisation: null,
          anonymizationEvent: null,
          isOnAllDossiersOfOrganisme: null,
        })
      })
  })

  it('Patch - Should return 400', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        truc: 456,
      })
      .expect(400)
  })

  it('Patch nbrMonth - Should return 200', async () => {
    await request(app.getHttpServer())
      .patch('/demarches/2/options')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        nbrMonthAnonymisation: 12,
      })
      .expect(200)
    const d = await demarcheService.findOneById(2)
    expect(d.nbrMonthAnonymisation).toBe(12)
  })

  it('Patch - Should return 400 for add anonymized field id', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        truc: '',
      })
      .expect(400)
  })

  it('Patch - Should return 400 for add anonymized field id', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        id: '02',
        add: '',
      })
      .expect(400)
  })

  it('Patch - Should return 403 for add anonymized field id', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.instructor}`)
      .send({
        id: '02',
        add: true,
      })
      .expect(403)
  })

  it('Patch - Should return 200 for add anonymized field id', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        id: '02',
        add: true,
      })
      .expect(200)
  })

  it('Patch - Should return 200 for remove anonymized field id', async () => {
    request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        id: '02',
        add: true,
      })
    return request(app.getHttpServer())
      .patch('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        id: '02',
        add: false,
      })
      .expect(200)
  })

  it('Get - Should return 200 for anonymized fields', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(200)
  })

  it('Get - Should return 403 for anonymized fields', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/options/field/anonymized')
      .set('Authorization', `Bearer ${tokens.instructor}`)
      .expect(403)
  })
})
