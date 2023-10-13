import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'

describe('Custom filters (e2e)', () => {
  let app: INestApplication
  let cookies: Cookies
  let filterService: CustomFilterService
  const customFilterFromFixture = {
    id: 1,
    name: 'My custom filter',
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

  const customFilterFromFixture2 = {
    ...customFilterFromFixture,
    id: 3,
    demarcheId: 5,
    name: `${customFilterFromFixture.name} 2`,
  }

  let demarchesCount = 0
  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    filterService = await app.resolve<CustomFilterService>(CustomFilterService)
    await filterService.remove({ name: 'Superman' })
    await filterService.remove({ name: 'Superman 2' })
    cookies = testingModule.cookies
    demarchesCount = await dataSource.manager.count(Demarche)
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('GET /custom-filters', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer()).get('/custom-filters').expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/custom-filters')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should return my filters', async () => {
      const filter = await filterService.repository.find({
        where: { userId: 5 },
      })

      return request(app.getHttpServer())
        .get('/custom-filters')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body instanceof Array).toBeTruthy()
          body.forEach((b, i) => {
            expect(filter[i]).toMatchObject(b)
          })
        })
    })
  })

  describe('GET /demarches/id/custom-filters', () => {
    it('Should give 401 of demarche 1', async () => {
      return request(app.getHttpServer())
        .get('/demarches/1/custom-filters')
        .expect(401)
    })

    it('Should give 401 of demarche 1', async () => {
      return request(app.getHttpServer())
        .get('/demarches/1/custom-filters')
        .expect(401)
    })

    it('Should return my filters of demarche 1', async () => {
      const filter = await filterService.repository.find({
        where: { userId: 5, demarcheId: 1 },
      })
      return request(app.getHttpServer())
        .get('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body instanceof Array).toBeTruthy()
          body.forEach((b, i) => {
            expect(filter[i]).toMatchObject(b)
          })
        })
    })

    it('Should return my filters of demarche 5', async () => {
      return request(app.getHttpServer())
        .get('/demarches/5/custom-filters')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject([customFilterFromFixture2])
        })
    })

    it('Should give 404 with demarche no existing', async () => {
      return request(app.getHttpServer())
        .get(`/demarches/${demarchesCount + 10}/custom-filters`)
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })
  })

  describe('POST /demarches/id/custom-filters', () => {
    it('Should give 400 with keys of totals not in columns', async () => {
      return request(app.getHttpServer())
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .send({
          name: 'Superman',
          groupByDossier: true,
          columns: ['I01', 'I02'],
          totals: ['I08'],
        })
        .expect(400)
    })

    it('Should add a filter', async () => {
      const filter = {
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
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .send(filter)
        .expect(201)
        .then(async ({ body }) => {
          expect(body).toMatchObject({ ...filter })
          const addedFilter = await filterService.repository.findOne({
            where: { name: 'Superman' },
          })
          expect(addedFilter).toMatchObject({ ...filter, userId: 5 })
        })
    })

    it('Should add a filter with totals', async () => {
      const filter = {
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
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .send(filter)
        .expect(201)
        .then(async ({ body }) => {
          expect(body).toMatchObject({ ...filter })
          const addedFilter = await filterService.repository.findOne({
            where: { name: 'Superman 2' },
          })
          expect(addedFilter).toMatchObject({ ...filter, userId: 5 })
        })
    })

    // TODO: actually testing interceptor demarche. Should be tested unitary
    it('Should not add a filter with demarche no existing', async () => {
      const filter = {
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
        .post(`/demarches/${demarchesCount + 10}/custom-filters`)
        .set('Cookie', [cookies.instructor])
        .send(filter)
        .expect(404)
    })

    it('Should return 400 without name', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .send()
        .expect(400)
    })

    it('Should return 400 if columns is incorrect', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
        .send({
          name: 'no columns',
        })
        .expect(400)
    })

    it('Should return 400 if sort is incorrect', () => {
      return request(app.getHttpServer())
        .post('/demarches/1/custom-filters')
        .set('Cookie', [cookies.instructor])
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
          .post('/demarches/1/custom-filters')
          .set('Cookie', [cookies.instructor])
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
      const filter1 = await filterService.repository.findOne({
        where: { userId: 5 }, // instructor user
      })
      const filter = {
        name: filter1.name,
        columns: ['I01', 'I02'],
        demarcheId: 1,
      }
      return request(app.getHttpServer())
        .post('/demarches/1/custom-filters/')
        .set('Cookie', [cookies.instructor])
        .send(filter)
        .expect(409)
    })
  })

  describe('PATCH /custom-filters/id', () => {
    it('Should patch an existing filter', async () => {
      const toUpdateFilter = await filterService.createAndSave({
        ...customFilterFromFixture,
        name: 'To Update',
        userId: 5,
      } as Partial<CustomFilter>)
      await request(app.getHttpServer())
        .patch(`/custom-filters/${toUpdateFilter.id}`)
        .set('Cookie', [cookies.instructor])
        .send({
          name: 'new name',
        })
        .expect(200)
        .then(async () => {
          const filter = await filterService.repository.findOne({
            where: { id: toUpdateFilter.id },
          })
          expect(filter).toMatchObject({
            ...customFilterFromFixture,
            id: toUpdateFilter.id,
            name: 'new name',
          })
        })
      await filterService.repository.delete({ id: toUpdateFilter.id })
    })
  })

  describe('DELETE /custom-filters/id', () => {
    it('Should delete an existing filter', async () => {
      const filter = await filterService.createAndSave({
        ...customFilterFromFixture,
        name: 'To Delete',
        userId: 5,
      } as Partial<CustomFilter>)
      const filterId = filter.id
      return request(app.getHttpServer())
        .delete('/custom-filters/' + filter.id)
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(async () => {
          const filter = await filterService.repository.findOne({
            where: { id: filterId },
          })
          expect(filter).toBeNull()
        })
    })
  })
})
