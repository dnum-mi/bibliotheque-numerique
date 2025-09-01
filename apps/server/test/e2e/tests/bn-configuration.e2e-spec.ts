import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import { faker } from '@faker-js/faker/locale/fr'
import { dataSource } from '../data-source-e2e.typeorm'
import { eBnConfiguration } from '@biblio-num/shared'

describe('bn-configurations (e2e)', () => {
  let app: INestApplication
  let tokens: Tokens

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    tokens = testingModule.tokens
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  describe('GET /bn-configurations', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()).get('/bn-configurations').expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403)
    })

    it('Should return all configurations', async () => {
      const response = await request(app.getHttpServer())
        .get('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(200)
      expect(response.body).toHaveLength(11)
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          keyName: eBnConfiguration.FE_EXCEL_IMPORT_SHEET_NAME,
          stringValue: 'sheet1',
          valueType: 'string',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]))
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          keyName: eBnConfiguration.FE_EXCEL_IMPORT_RANGE,
          stringValue: 'A1:Z1000',
          valueType: 'string',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(Number),
          keyName: eBnConfiguration.FE_AMOUNT_CHAMP_TAG,
          stringValue: 'fe-amount-champ',
          valueType: 'string',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          keyName: eBnConfiguration.FILE_MAXIMUM_SIZE,
          stringValue: '5242880',
          valueType: 'number',
        }),
        expect.objectContaining({
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          keyName: eBnConfiguration.LAST_ORGANISM_SYNC_AT,
          stringValue: expect.any(String),
          valueType: 'date',
        }),
        expect.objectContaining({
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          keyName: eBnConfiguration.LAST_FOUNDATION_SYNC_AT,
          stringValue: expect.any(String),
          valueType: 'date',
        }),
        expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
          keyName: eBnConfiguration.DDC_FIRST_CONTROL_YEAR,
          stringValue: expect.any(String),
          valueType: 'number',
        }),
        expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
          keyName: eBnConfiguration.DDC_MONTH_BEFORE_MISSING,
          stringValue: expect.any(String),
          valueType: 'number',
        }),
        expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
          keyName: eBnConfiguration.ENABLE_HUB_SEARCH,
          stringValue: 'false',
          valueType: 'boolean',
        }),
        expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
          keyName: eBnConfiguration.SYNC_RNA_VIA_HUB,
          stringValue: 'false',
          valueType: 'boolean',
        }),
        expect.objectContaining({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(Number),
          keyName: eBnConfiguration.SYNC_RNF_VIA_HUB,
          stringValue: 'false',
          valueType: 'boolean',
        }),
      ]))
    })
  })

  describe('GET /bn-configurations/:keyName', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .expect(403)
    })

    it('Should return 400 for bad keyName', async () => {
      await request(app.getHttpServer())
        .get('/bn-configurations/TOTO')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(400)
    })

    it('Should return configuration by keyName', async () => {
      const response = await request(app.getHttpServer())
        .get('/bn-configurations/FE_EXCEL_IMPORT_SHEET_NAME')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(200)
      expect(response.body).toEqual({
        id: 1,
        keyName: 'FE_EXCEL_IMPORT_SHEET_NAME',
        stringValue: 'sheet1',
        valueType: 'string',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })
  })

  describe('POST /bn-configurations', () => {
    const keyName = 'FE_EXCEL_IMPORT_SHEET_NAME'
    const stringValue = faker.word.sample()
    const valueType = 'string'

    it('Should return error 401', async () => {
      await request(await app.getHttpServer())
        .post('/bn-configurations')
        .send({ keyName, stringValue, valueType })
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer())
        .post('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer())
        .post('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer())
        .post('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should create configuration', async () => {
      await request(app.getHttpServer())
        .delete('/bn-configurations/1')
        .set('Authorization', `Bearer ${tokens.sudo}`)
      await request(app.getHttpServer())
        .post('/bn-configurations')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName, stringValue, valueType })
        .expect(201)
    })
  })

  describe('PATCH /bn-configurations/:id', () => {
    const id = 2
    const stringValue = faker.word.sample()
    const valueType = 'string'

    it('Should return error 401', async () => {
      await request(await app.getHttpServer())
        .patch(`/bn-configurations/${id}`)
        .send({ stringValue, valueType })
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should update configuration', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ stringValue, valueType })
        .expect(200)
    })
  })

  describe('DELETE /bn-configurations/:id', () => {
    const id = 3

    it('Should return error 401', async () => {
      await request(app.getHttpServer())
        .delete(`/bn-configurations/${id}`)
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer())
        .delete(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer())
        .delete(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer())
        .delete(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .expect(403)
    })

    it('Should delete configuration', async () => {
      await request(app.getHttpServer())
        .delete(`/bn-configurations/${id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(200)
    })
  })
})
