import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { getUserCookie } from '../common/get-user-cookie'
import { getAdminCookie } from '../common/get-admin-cookie'
import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'
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

  it('patch identification should update mappingColumn with identification equal FE ', async () => {
    const demarche = await dataSource.manager.findOne(Demarche, {
      where: { title: Like('[UPDATE-IDENTIFICATION]%') },
    })

    const { body } = await request(app.getHttpServer())
      .patch(`/demarches/${demarche.id}/identification`)
      .set('Cookie', [adminCookie])
      .send({
        identification: 'FE',
      })
      .expect(200)

    expect(body).toHaveProperty('message', `Demarche of id ${demarche.id} has been update with identification FE.`)

    const demarche1 = await dataSource.manager.findOne(Demarche, {
      where: { id: demarche.id },
    })
    expect(demarche1).toHaveProperty('identification', 'FE')
    expect(demarche1.mappingColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          {
            id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
          },
        ),
        expect.objectContaining(
          {
            id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
          },
        ),
      ],
      ),
    )
  })

  it('patch identification should delete fix-field of instrection into mappingColumn with identification equal at null', async () => {
    const demarche = await dataSource.manager.findOne(Demarche, {
      where: { title: Like('[DELETE-IDENTIFICATION]%') },
    })

    const { body } = await request(app.getHttpServer())
      .patch(`/demarches/${demarche.id}/identification`)
      .set('Cookie', [adminCookie])
      .send({
        identification: null,
      })
      .expect(200)

    expect(body).toHaveProperty('message', `Demarche of id ${demarche.id} has been update with identification null.`)

    const demarche1 = await dataSource.manager.findOne(Demarche, {
      where: { id: demarche.id },
    })
    expect(demarche1).toHaveProperty('identification', null)
    expect(demarche1.mappingColumns).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining(
          {
            id: 'ca6b1946-efe2-448d-b9e3-645829093dc5',
          },
        ),
        expect.objectContaining(
          {
            id: 'ca6b1946-efe2-448d-b9e3-645829093dc6',
          },
        ),
      ],
      ),
    )
  })

  it('patch identification should return 400 if identification is undefined', async () => {
    const demarche = await dataSource.manager.findOne(Demarche, {
      where: { title: Like('[UNDEFINED-IDENTIFICATION]%') },
    })

    await request(app.getHttpServer())
      .patch(`/demarches/${demarche.id}/identification`)
      .set('Cookie', [adminCookie])
      .send({
      })
      .expect(400)
  })
})
