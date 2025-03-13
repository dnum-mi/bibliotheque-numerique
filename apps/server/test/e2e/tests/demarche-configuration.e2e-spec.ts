import { INestApplication } from '@nestjs/common'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { FieldType } from '@biblio-num/shared'

describe('Configuration ', () => {
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

  it('GET - Should return 401 on configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/configurations')
      .expect(401)
  })

  it('GET - Should return 403 for instructor', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/configurations')
      .set('Authorization', `Bearer ${tokens.instructor}`)
      .expect(403)
  })

  it('GET - Should return 403 on admin to other demarche', async () => {
    return request(app.getHttpServer())
      .get('/demarches/1/configurations')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(403)
  })

  it('GET - Should return 404 on configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/8765/configurations')
      .set('Authorization', `Bearer ${tokens.superadmin}`)
      .expect(404)
  })

  it('GET - Should return 200 and configurations', async () => {
    return request(app.getHttpServer())
      .get('/demarches/2/configurations')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual([
          {
            id: '01',
            type: 'string',
            columnLabel: null,
            originalLabel: 'Title',
            formatFunctionRef: null,
          },
          {
            id: '02',
            type: 'string',
            columnLabel: 'already a custom label',
            originalLabel: 'state',
            formatFunctionRef: 'state',
          },
        ])
      })
  })

  it('Patch /:fieldId - Should return 400', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/configurations/01')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        columnLabel: 456,
      })
      .expect(400)
  })

  it('Patch /:fieldId - Should return 400', async () => {
    return request(app.getHttpServer())
      .patch('/demarches/2/configurations/01')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .expect(200)
  })

  it('Patch /:fieldId - Should change label of field', async () => {
    const newLabel = 'fieauyrbgkweuryb'
    const originalConfiguration = [
      {
        id: '01',
        type: FieldType.string,
        columnLabel: null,
        originalLabel: 'Title',
        formatFunctionRef: null,
      },
      {
        id: '02',
        type: FieldType.string,
        columnLabel: 'already a custom label',
        originalLabel: 'state',
        formatFunctionRef: 'state',
      },
    ]
    await request(app.getHttpServer())
      .patch('/demarches/2/configurations/01')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        columnLabel: newLabel,
      })
      .expect(200)
      .then(() => {
        return request(app.getHttpServer())
          .get('/demarches/2/configurations')
          .set('Authorization', `Bearer ${tokens.admin}`)
          .expect(200)
      })
      .then(({ body }) => {
        expect(body).toEqual([
          {
            ...originalConfiguration[0],
            columnLabel: newLabel,
          },
          originalConfiguration[1],
        ])
      })
    await demarcheService.repository.update(
      { id: 2 },
      { mappingColumns: originalConfiguration },
    )
  })
})
