import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Tokens, TestingModuleFactory } from '../common/testing-module.factory'
import { ViewService } from '@/modules/views/providers/services/view.service'
import { View } from '@/modules/views/objects/entities/view.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

describe('Views (e2e)', () => {
  let app: INestApplication
  let tokens: Tokens
  let viewService: ViewService
  const viewFromFixture = {
    id: 1,
    name: 'My view',
    groupByDossier: false,
    columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
    sorts: [
      { key: 'I01', order: 'ASC' },
      { key: 'I02', order: 'DESC' },
    ],
    filters: {
      I01: {
        filterType: 'text',
        operator: 'AND',
        condition1: { type: 'contains', filter: 'toto' },
        condition2: { type: 'contains', filter: 'tata' },
      },
    },
    demarcheId: 1,
  }

  const viewFromFixture2 = {
    ...viewFromFixture,
    id: 3,
    demarcheId: 5,
    name: `${viewFromFixture.name} 2`,
  }

  let demarchesCount = 0
  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    viewService = await app.resolve<ViewService>(ViewService)
    await viewService.remove({ name: 'Superman' })
    await viewService.remove({ name: 'Superman 2' })
    tokens = testingModule.tokens
    demarchesCount = await dataSource.manager.count(Demarche)
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('GET /views', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer()).get('/views').expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/views')
        .set('Authorization', `Bearer ${tokens.norole}`)
        .expect(403)
    })

    it('Should return my views', async () => {
      const views = await viewService.repository.find({
        where: { userId: 5 },
      })

      return request(app.getHttpServer())
        .get('/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then(({ body }) => {
          expect(body instanceof Array).toBeTruthy()
          body.forEach((b, i) => {
            expect(views[i]).toMatchObject(b)
          })
        })
    })
  })

  describe('GET /demarches/id/views', () => {
    it('Should give 401 of demarche 1', async () => {
      return request(app.getHttpServer())
        .get('/demarches/1/views')
        .expect(401)
    })

    it('Should give 403 of demarche 2', async () => {
      return request(app.getHttpServer())
        .get('/demarches/2/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should return my views of demarche 1', async () => {
      const views = await viewService.repository.find({
        where: { userId: 5, demarcheId: 1 },
      })
      return request(app.getHttpServer())
        .get('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then(({ body }) => {
          expect(body instanceof Array).toBeTruthy()
          body.forEach((b, i) => {
            expect(views[i]).toMatchObject(b)
          })
        })
    })

    it('Should return my views of demarche 5', async () => {
      return request(app.getHttpServer())
        .get('/demarches/5/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject([viewFromFixture2])
        })
    })

    it('Should give 404 with demarche no existing', async () => {
      return request(app.getHttpServer())
        .get(`/demarches/${demarchesCount + 10}/views`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)
    })
  })

  describe('POST /demarches/id/views', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer())
        .post('/demarches/2/views')
        .expect(401)
    })

    it('Should give 403 of demarche 2', async () => {
      return request(app.getHttpServer())
        .post('/demarches/2/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(403)
    })

    it('Should give 400 with keys of totals not in columns', async () => {
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          name: 'Superman',
          groupByDossier: true,
          columns: ['I01', 'I02'],
          totals: ['I08'],
        })
        .expect(400)
    })

    it('Should add a view', async () => {
      const view = {
        name: 'Superman',
        groupByDossier: true,
        columns: ['I01', 'I02'],
        sorts: [{ key: 'I02', order: 'DESC' }],
        filters: {
          I02: {
            operator: 'OR',
            condition1: { type: 'contains', filter: 'super' },
            condition2: { type: 'contains', filter: 'man' },
            filterType: 'text',
          },
        },
      }
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send(view)
        .expect(201)
        .then(async ({ body }) => {
          expect(body).toMatchObject({ ...view })
          const addedFilter = await viewService.repository.findOne({
            where: { name: 'Superman' },
          })
          expect(addedFilter).toMatchObject({ ...view, userId: 5 })
        })
    })

    it('Should add a view with totals', async () => {
      const view = {
        name: 'Superman 2',
        groupByDossier: true,
        columns: ['I01', 'I02', 'I08'],
        sorts: [{ key: 'I02', order: 'DESC' }],
        filters: {
          I02: {
            operator: 'OR',
            condition1: { type: 'contains', filter: 'super' },
            condition2: { type: 'contains', filter: 'man' },
            filterType: 'text',
          },
        },
        totals: ['I08'],
      }
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send(view)
        .expect(201)
        .then(async ({ body }) => {
          expect(body).toMatchObject({ ...view })
          const addedView = await viewService.repository.findOne({
            where: { name: 'Superman 2' },
          })
          expect(addedView).toMatchObject({ ...view, userId: 5 })
        })
    })

    it('Should not add a view with demarche no existing', async () => {
      const view = {
        name: 'Superman1',
        groupByDossier: true,
        columns: ['I01', 'I02'],
        sorts: [{ key: 'I02', order: 'DESC' }],
        filters: {
          I02: {
            operator: 'OR',
            condition1: { type: 'contains', filter: 'super' },
            condition2: { type: 'contains', filter: 'man' },
            filterType: 'text',
          },
        },
      }
      return request(app.getHttpServer())
        .post(`/demarches/${demarchesCount + 10}/views`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send(view)
        .expect(404)
    })

    it('Should return 400 without name', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send()
        .expect(400)
    })

    it('Should return 400 if columns is incorrect', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          name: 'no columns',
        })
        .expect(400)
    })

    it('Should return 400 if sort is incorrect', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/views')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          name: 'wrong sort',
          columns: ['toto', 'tata'],
          sorts: ['something'],
        })
        .expect(400)
    })

    const badFilters = [
      {},
      { filterType: 'text' },
      {
        condition1: {
          type: 'equals',
        },
      },
      {
        filterType: 'text',
        condition1: {
          type: 'eq',
        },
      },
      {
        filterType: 'text',
        condition1: {
          filter: 'toto',
        },
      },
      {
        filterType: 'text',
        condition1: {
          type: 'equals',
          filter: 'toto',
        },
        condition2: {
          operator: 'equals',
          filter: 'toto',
        },
      },
      {
        filterType: 'text',
        condition1: {
          type: 'equals',
          filter: 'toto',
        },
        condition2: {
          type: 'equals',
          filter: 'toto',
        },
      },
      {
        filterType: 'text',
        condition1: {
          type: 'equals',
          filter: 'toto',
        },
        operator: 'OR',
      },
      {
        filterType: 'text',
        condition1: {
          type: 'equals',
          filter: 'toto',
        },
        operator: 'TUTU',
        condition2: {
          type: 'equals',
          filter: 'toto',
        },
      },
    ]

    badFilters.forEach((badFilter, i) => {
      it(`Should return 400 if filter is incorrect (p-${i})`, () => {
        return request(app.getHttpServer())
          .post('/demarches/1/views')
          .set('Authorization', `Bearer ${tokens.instructor}`)
          .send({
            name: 'badFilter',
            columns: ['I01', 'I02', 'I03'],
            filters: { I01: badFilter },
            demarcheId: 1,
          })
          .expect(400)
      })
    })

    it('Should not add a filter with same name', async () => {
      const filter1 = await viewService.repository.findOne({
        where: { userId: 5 }, // instructor user
      })
      const filter = {
        name: filter1.name,
        columns: ['I01', 'I02'],
        demarcheId: 1,
      }
      return request(app.getHttpServer())
        .post('/demarches/1/views/')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send(filter)
        .expect(409)
    })
  })

  describe('PATCH /views/id', () => {
    it('Should patch an existing view', async () => {
      const toUpdateView = await viewService.createAndSave({
        ...viewFromFixture,
        name: 'To Update',
        userId: 5,
      } as Partial<View>)
      await request(app.getHttpServer())
        .patch(`/views/${toUpdateView.id}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          name: 'new name',
        })
        .expect(200)
        .then(async () => {
          const filter = await viewService.repository.findOne({
            where: { id: toUpdateView.id },
          })
          expect(filter).toMatchObject({
            ...viewFromFixture,
            id: toUpdateView.id,
            name: 'new name',
          })
        })
      await viewService.repository.delete({ id: toUpdateView.id })
    })
  })

  describe('DELETE /views/id', () => {
    it('Should delete an existing view', async () => {
      const view = await viewService.createAndSave({
        ...viewFromFixture,
        name: 'To Delete',
        userId: 5,
      } as Partial<View>)
      const filterId = view.id
      return request(app.getHttpServer())
        .delete('/views/' + view.id)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then(async () => {
          const filter = await viewService.repository.findOne({
            where: { id: filterId },
          })
          expect(filter).toBeNull()
        })
    })
  })
})
