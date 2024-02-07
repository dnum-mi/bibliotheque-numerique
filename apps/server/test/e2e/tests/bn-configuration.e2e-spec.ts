import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { faker } from '@faker-js/faker/locale/fr'
import { dataSource } from '../data-source-e2e.typeorm'

describe('bn-configurations (e2e)', () => {
  let app: INestApplication
  let cookies: Cookies

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await dataSource.destroy()
    await app.close()
  })

  describe('GET /bn-configurations', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations')
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations')
        .set('Cookie', [cookies.admin])
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations')
        .set('Cookie', [cookies.superadmin])
        .expect(403)
    })

    it('Should return all configurations', async () => {
      const response = await request(app.getHttpServer()) //
        .get('/bn-configurations')
        .set('Cookie', [cookies.sudo])
        .expect(200)
      expect(response.body).toEqual([
        {
          id: 1,
          keyName: 'EXCEL_IMPORT_SHEET_NAME',
          stringValue: 'sheet1',
          valueType: 'string',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        {
          id: 2,
          keyName: 'EXCEL_IMPORT_RANGE',
          stringValue: 'A1:Z1000',
          valueType: 'string',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ])
    })
  })

  describe('GET /bn-configurations/:keyName', () => {
    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Cookie', [cookies.instructor])
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Cookie', [cookies.admin])
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer()) //
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Cookie', [cookies.superadmin])
        .expect(403)
    })

    it('Should return configuration by keyName', async () => {
      const response = await request(app.getHttpServer()) //
        .get('/bn-configurations/EXCEL_IMPORT_SHEET_NAME')
        .set('Cookie', [cookies.sudo])
        .expect(200)
      expect(response.body).toEqual({
        id: 1,
        keyName: 'EXCEL_IMPORT_SHEET_NAME',
        stringValue: 'sheet1',
        valueType: 'string',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })
  })

  describe('POST /bn-configurations', () => {
    const keyName = 'EXCEL_IMPORT_CHAMP_ID'
    const stringValue = faker.word.sample()
    const valueType = 'string'

    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .post('/bn-configurations')
        .send({ keyName, stringValue, valueType })
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .post('/bn-configurations')
        .set('Cookie', [cookies.instructor])
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer()) //
        .post('/bn-configurations')
        .set('Cookie', [cookies.admin])
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer()) //
        .post('/bn-configurations')
        .set('Cookie', [cookies.superadmin])
        .send({ keyName, stringValue, valueType })
        .expect(403)
    })

    it('Should create configuration', async () => {
      const response = await request(app.getHttpServer()) //
        .post('/bn-configurations')
        .set('Cookie', [cookies.sudo])
        .send({ keyName, stringValue, valueType })
        .expect(201)
      expect(response.body).toEqual({ message: `Configuration ${keyName} has been created` })
    })
  })

  describe('PATCH /bn-configurations/:id', () => {
    const id = 1
    const stringValue = faker.word.sample()
    const valueType = 'string'

    it('Should return error 401', async () => {
      await request(app.getHttpServer()) //
        .patch(`/bn-configurations/${id}`)
        .send({ stringValue, valueType })
        .expect(401)
    })

    it('Should return error 403 for instructor', async () => {
      await request(app.getHttpServer()) //
        .patch(`/bn-configurations/${id}`)
        .set('Cookie', [cookies.instructor])
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for admin', async () => {
      await request(app.getHttpServer()) //
        .patch(`/bn-configurations/${id}`)
        .set('Cookie', [cookies.admin])
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should return error 403 for superadmin', async () => {
      await request(app.getHttpServer()) //
        .patch(`/bn-configurations/${id}`)
        .set('Cookie', [cookies.superadmin])
        .send({ stringValue, valueType })
        .expect(403)
    })

    it('Should update configuration', async () => {
      const response = await request(app.getHttpServer()) //
        .patch(`/bn-configurations/${id}`)
        .set('Cookie', [cookies.sudo])
        .send({ stringValue, valueType })
        .expect(200)
      expect(response.body).toEqual({ message: `Configuration ${id} has been updated` })
    })
  })
})
