import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Like } from 'typeorm'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

describe('Demarches (e2e)', () => {
  let app: INestApplication
  let cookies: Cookies
  let demarcheService: DemarcheService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    demarcheService = await app.resolve(DemarcheService)
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('GET /demarches/small', () => {
    it('Should be 401', async () => {
      return request(app.getHttpServer()).get('/demarches/small').expect(401)
    })

    it('Should be 403', async () => {
      return await request(app.getHttpServer())
        .get('/demarches/small')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should Get small should return only title and id', async () => {
      return request(app.getHttpServer())
        .get('/demarches/small')
        .set('Cookie', [cookies.superadmin])
        .expect(200)
        .then(async ({ body }) => {
          const nbr = await demarcheService.repository.count()
          expect(body.length).toEqual(nbr)
          body.forEach((d) => {
            expect(Object.keys(d)).toEqual(['id', 'title', 'types', 'dsId', 'identification'])
          })
        })
    })

    it('should only have my demarche', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/demarches/small')
        .set('Cookie', [cookies.instructor])
        .expect(200)
      expect(body).toHaveLength(2)
      expect(body[0]).toHaveProperty('id', 1)
      expect(body[1]).toHaveProperty('id', 5)
    })
  })

  describe('Patch /demarche/:id', () => {
    it('Should be 401', async () => {
      return request(await app.getHttpServer())
        .patch('/demarches/1')
        .send({
          identification: 'FE',
        })
        .expect(401)
    })

    it('Patch should only be possible for sudo', () => {
      return request(app.getHttpServer())
        .patch('/demarches/1')
        .set('Cookie', [cookies.admin])
        .send({
          identification: 'FE',
        })
        .expect(403)
    })

    it('Should update mappingColumn with identification equal FE ', async () => {
      const demarche = await dataSource.manager.findOne(Demarche, {
        where: { title: Like('[UPDATE-IDENTIFICATION]%') },
      })

      const { body } = await request(app.getHttpServer())
        .patch(`/demarches/${demarche.id}`)
        .set('Cookie', [cookies.sudo])
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

    // eslint-disable-next-line max-len
    it('Should patch identification should delete fix-field of intersection into mappingColumn with identification equal to null and types undefined.', async () => {
      const { body } = await request(app.getHttpServer())
        .patch('/demarches/6')
        .set('Cookie', [cookies.sudo])
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
        .set('Cookie', [cookies.sudo])
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
        .set('Cookie', [cookies.sudo])
        .send({})
        .expect(400)
    })
  })

  describe('Patch /demarche/:id/soft-delete', () => {
    it('Should be 401', () => {
      return request(app.getHttpServer())
        .patch('/demarches/1/soft-delete')
        .expect(401)
    })

    it('Patch should only be possible for sudo', () => {
      return request(app.getHttpServer())
        .patch('/demarches/1/soft-delete')
        .set('Cookie', [cookies.admin])
        .expect(403)
    })

    it('Should soft delete demarche', async () => {
      const demarche = await dataSource.manager.findOne(Demarche, {
        where: { title: Like('[SOFT-DELETE]%') },
      })

      const { body } = await request(app.getHttpServer())
        .patch(`/demarches/${demarche.id}/soft-delete`)
        .set('Cookie', [cookies.sudo])
        .expect(200)

      expect(body).toHaveProperty(
        'message',
        `Demarche of id ${demarche.id} has been soft deleted.`,
      )

      const demarche1 = await dataSource.manager.findOne(Demarche, {
        where: { id: demarche.id },
      })
      expect(demarche1).toBeNull()

      const demarche1Dossiers: Dossier[] = await dataSource.manager.getRepository(Dossier).find({
        where: { demarcheId: demarche.id },
      })
      expect(demarche1Dossiers).toEqual([])
    })

    it('Should return 404 if demarche not found', async () => {
      await request(app.getHttpServer())
        .patch('/demarches/999/soft-delete')
        .set('Cookie', [cookies.sudo])
        .expect(404)
    })
  })
})
