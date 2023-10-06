import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { getUserCookie } from '../common/get-user-cookie'
import { getAdminCookie } from '../common/get-admin-cookie'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Like } from 'typeorm'

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
    const { body } = await request(app.getHttpServer())
      .get('/demarches')
      .set('Cookie', [userCookie])
      .expect(200)
    expect(body).toHaveLength(1)
    expect(body[0]).toHaveProperty('id', 3)
  })

  it('Should Get small should only be accessible for admin', async () => {
    return request(app.getHttpServer())
      .get('/demarches/small')
      .set('Cookie', [userCookie])
      .expect(403)
  })

  it('Should Get small should return only title and id', async () => {
    return request(app.getHttpServer())
      .get('/demarches/small')
      .set('Cookie', [adminCookie])
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toBeGreaterThan(0)
        body.forEach((d) => {
          expect(Object.keys(d)).toEqual(['id', 'title', 'dsId'])
        })
      })
  })

  it('Should patch identification should update mappingColumn with identification equal FE ', async () => {
    const demarche = await dataSource.manager.findOne(Demarche, {
      where: { title: Like('[UPDATE-IDENTIFICATION]%') },
    })

    const { body } = await request(app.getHttpServer())
      .patch(`/demarches/${demarche.id}`)
      .set('Cookie', [adminCookie])
      .send({
        identification: 'FE',
      })
      .expect(200)

    expect(body).toHaveProperty(
      'message',
      `Demarche of id ${demarche.id} has been update with identification FE and types undefined.`,
    )

    const demarche1 = await dataSource.manager.findOne(Demarche, {
      where: { id: demarche.id },
    })
    expect(demarche1).toHaveProperty('identification', 'FE')
    expect(demarche1.mappingColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
        }),
        expect.objectContaining({
          id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
        }),
      ]),
    )
  })

  it('Should patch identification should delete fix-field of intersection into mappingColumn with identification equal to null and types undefined.', async () => {
    const { body } = await request(app.getHttpServer())
      .patch('/demarches/6')
      .set('Cookie', [adminCookie])
      .send({
        identification: null,
      })
      .expect(200)

    expect(body).toHaveProperty(
      'message',
      'Demarche of id 6 has been update with identification null and types undefined.',
    )

    const demarche1 = await dataSource.manager.findOne(Demarche, {
      where: { id: 6 },
    })
    expect(demarche1).toHaveProperty('identification', null)
    expect(demarche1.mappingColumns).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
        }),
        expect.objectContaining({
          id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
        }),
      ]),
    )
  })

  it('Should patch types ', async () => {
    const types = ['FE', 'ARUP', 'FRUP']

    const { body } = await request(app.getHttpServer())
      .patch('/demarches/5')
      .set('Cookie', [adminCookie])
      .send({ types })
      .expect(200)

    expect(body).toHaveProperty(
      'message',
      `Demarche of id 5 has been update with identification undefined and types ${types}.`,
    )

    const demarche1 = await dataSource.manager.findOne(Demarche, {
      where: { id: 5 },
    })
    expect(demarche1).toHaveProperty('types', types)
  })

  it('Should patch identification should return 400 if identification and type is undefined', async () => {
    await request(app.getHttpServer())
      .patch('/demarches/7')
      .set('Cookie', [adminCookie])
      .send({})
      .expect(400)
  })
})
