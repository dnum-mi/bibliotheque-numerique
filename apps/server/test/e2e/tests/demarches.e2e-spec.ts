import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Like } from 'typeorm'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

describe('Demarches (e2e)', () => {
  let app: INestApplication
  let tokens: Tokens
  let demarcheService: DemarcheService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    demarcheService = await app.resolve(DemarcheService)
    tokens = testingModule.tokens
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
        .set('Authorization', `Bearer ${tokens.norole}`)
        .expect(403)
    })

    it('Should Get small should return only title and id', async () => {
      return request(app.getHttpServer())
        .get('/demarches/small')
        .set('Authorization', `Bearer ${tokens.superadmin}`)
        .expect(200)
        .then(async ({ body }) => {
          const nbr = await demarcheService.repository.count()
          expect(body.length).toEqual(nbr)
          body.forEach((d) => {
            expect(Object.keys(d)).toEqual([
              'id',
              'title',
              'types',
              'dsId',
              'identification',
            ])
          })
        })
    })

    it('should only have my demarche', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/demarches/small')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
      expect(body).toHaveLength(2)
      expect(body[0]).toHaveProperty('id', 1)
      expect(body[1]).toHaveProperty('id', 5)
    })
  })

  describe('POST /demarches/small/list', () => {
    it('Should be 401', async () => {
      return request(app.getHttpServer())
        .post('/demarches/small/list')
        .expect(401)
    })

    it('Should be 403', async () => {
      return await request(app.getHttpServer())
        .post('/demarches/small/list')
        .set('Authorization', `Bearer ${tokens.norole}`)
        .expect(403)
    })

    it('should return a list of demarche 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/demarches/small/list')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          columns: ['id', 'title'],
        })
        .expect(201)

      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0]).toHaveProperty('id', 1)
      expect(response.body.data[1]).toHaveProperty('id', 5)
    })

    it('should return a list of demarche with title filtering', async () => {
      const response = await request(app.getHttpServer())
        .post('/demarches/small/list')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          sorts: [],
          filters: {
            title: {
              filterType: 'text',
              condition1: { filter: '[UPDATE-IDENTIFICATION]', type: 'contains' },
            },
          },
          columns: [
            'id',
            'title',
          ],
          perPage: 20,
          page: 1,
        })
        .expect(201)

      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data).toEqual([
        { id: 5, title: '[UPDATE-IDENTIFICATION] Déclaration de FE' },
      ])
    })

    it('should return a list of demarche with title sorting', async () => {
      const response = await request(app.getHttpServer())
        .post('/demarches/small/list')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          sorts: [
            { key: 'title', order: 'DESC' },
          ],
          filters: null,
          columns: [
            'id',
            'title',
          ],
          perPage: 20,
          page: 1,
        })
        .expect(201)

      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data).toEqual([
        { id: 5, title: '[UPDATE-IDENTIFICATION] Déclaration de FE' },
        { id: 1, title: 'Déclaration de FE' },
      ])
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
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          identification: 'FE',
        })
        .expect(403)
    })

    it('Should update mappingColumn with identification equal FE ', async () => {
      const demarche = await dataSource.manager.findOne(Demarche, {
        where: { title: Like('[UPDATE-IDENTIFICATION]%') },
      })

      await request(app.getHttpServer())
        .patch(`/demarches/${demarche.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({
          identification: 'FE',
        })
        .expect(200)

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

    it(`Should patch identification and remove fix-field of intersection in mappingColumn when
      identification is null and types are undefined.`, async () => {
      await request(app.getHttpServer())
        .patch('/demarches/6')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ identification: null })
        .expect(200)

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
      const types = ['FE', 'ASSO', 'FRUP']

      await request(app.getHttpServer())
        .patch('/demarches/5')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ types })
        .expect(200)

      const demarche1 = await dataSource.manager.findOne(Demarche, {
        where: { id: 5 },
      })
      expect(demarche1).toHaveProperty('types', types)
    })

    it('Should patch identification should return 400 if identification and type is undefined', async () => {
      await request(app.getHttpServer())
        .patch('/demarches/7')
        .set('Authorization', `Bearer ${tokens.sudo}`)
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
        .set('Authorization', `Bearer ${tokens.admin}`)
        .expect(403)
    })

    it('Should soft delete demarche', async () => {
      const demarche = await dataSource.manager.findOne(Demarche, {
        where: { title: Like('[SOFT-DELETE]%') },
      })

      await request(app.getHttpServer())
        .patch(`/demarches/${demarche.id}/soft-delete`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(200)

      const demarche1 = await dataSource.manager.findOne(Demarche, {
        where: { id: demarche.id },
      })
      expect(demarche1).toBeNull()

      const demarche1Dossiers: Dossier[] = await dataSource.manager
        .getRepository(Dossier)
        .find({
          where: { demarcheId: demarche.id },
        })
      expect(demarche1Dossiers).toEqual([])
    })

    it('Should return 404 if demarche not found', async () => {
      await request(app.getHttpServer())
        .patch('/demarches/999/soft-delete')
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .expect(404)
    })
  })
})
