import { INestApplication } from '@nestjs/common'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'
import * as request from 'supertest'
import * as dayjs from 'dayjs'

describe('Dossier listing', () => {
  let app: INestApplication
  let cookies: Cookies

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it('Should return 401 if not connected', async () => {
    return request(await app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        idDs: 42,
      })
      .expect(401)
  })

  it('Should return 403', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .set('Cookie', [cookies.norole])
      .send({
        idDs: 42,
      })
      .expect(403)
  })

  it('Should return 403 wrong demarche', () => {
    return request(app.getHttpServer())
      .post('/demarches/2/dossiers-search')
      .set('Cookie', [cookies.instructor])
      .send({
        idDs: 42,
      })
      .expect(403)
  })

  it('Should return 404 if demarche doesnt exist', () => {
    return request(app.getHttpServer())
      .get('/demarches/13847/dossiers-search')
      .set('Cookie', [cookies.superadmin])
      .expect(404)
  })

  it('Should return 400 if query is empty', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if page is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: -1,
        columns: ['I01', 'I02', 'I03'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if perPage is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        perPage: 500,
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if sorts is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        sorts: [{ toto: 'I03', order: 'ASC' }],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if sort contain key not in column', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        sorts: [{ key: 'I04', order: 'ASC' }],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if filter contain key not in column', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        filters: {
          I09: {
            filterType: 'text',
            condition1: {
              type: 'contains',
              filter: 'atar',
            },
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should Paginate correctly with default options', () => {
    return (
      request(app.getHttpServer())
        .post('/demarches/1/dossiers-search')
        .send({
          columns: ['I01', 'I02', 'I03', 'I09'],
        })
        .set('Cookie', [cookies.superadmin])
        .expect(200)
        .expect(({ body }) => {
          expect(body.total).toEqual(10)
          expect(body.data.length).toEqual(5)
          expect(body.data).toEqual([
            {
              dossierId: 1,
              I01: 'W00000001',
              I02: dayjs('2023-06-01').toISOString(),
              I03: 'Avenger',
              I09: ['Qatar', 'Turquie'],
            },
            {
              dossierId: 2,
              I01: 'W00000002',
              I02: dayjs('2023-06-03').toISOString(),
              I03: 'Interstellar',
              I09: null,
            },
            {
              dossierId: 3,
              I01: 'W00000003',
              I02: dayjs('2023-06-04').toISOString(),
              I03: 'Dune',
              I09: expect.arrayContaining(['USA', 'Écosse']),
            },
            {
              dossierId: 4,
              I01: 'W00000004',
              I02: dayjs('2023-06-02').toISOString(),
              I03: 'Memento',
              I09: null,
            },
            {
              dossierId: 5,
              I01: 'W00000005',
              I02: dayjs('2023-06-01').toISOString(),
              I03: 'Captain Fantastic',
              I09: ['USA', 'Qatar', 'France'],
            },
          ])
        })
    )
  })

  it('Should Paginate correctly with pagination', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(10)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 6,
            I01: 'W00000006',
            I02: dayjs('2023-06-02').toISOString(),
            I03: "Ender's game",
            I08: [8800],
            I09: ['Turquie'],
          },
          {
            dossierId: 7,
            I01: 'W00000007',
            I02: dayjs('2023-06-04').toISOString(),
            I03: 'Barbie',
            I08: [6400, 2500],
            I09: ['Qatar', 'USA'],
          },
          {
            dossierId: 8,
            I01: 'W00000002',
            I02: dayjs('2023-06-03').toISOString(),
            I03: "L'homme invisible",
            I08: null,
            I09: null,
          },
          {
            dossierId: 9,
            I01: 'W00000009',
            I02: dayjs('2023-06-13').toISOString(),
            I03: 'Telma & Louise',
            I08: null,
            I09: null,
          },
          {
            dossierId: 10,
            I01: 'W00000010',
            I02: dayjs('2023-06-06').toISOString(),
            I03: 'Premier Contact',
            I08: [17400, 8600, 19200, 15600, 23000],
            I09: ['USA', 'Écosse', 'Turquie', 'France', 'Qatar'],
          },
        ])
      })
  })

  it('Should Paginate correctly with sort (by title)', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
        sorts: [{ key: 'I03', order: 'ASC' }],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(10)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 2,
            I01: 'W00000002',
            I02: dayjs('2023-06-03').toISOString(),
            I03: 'Interstellar',
            I08: null,
            I09: null,
          },
          {
            dossierId: 8,
            I01: 'W00000002',
            I02: dayjs('2023-06-03').toISOString(),
            I03: "L'homme invisible",
            I08: null,
            I09: null,
          },
          {
            dossierId: 4,
            I01: 'W00000004',
            I02: dayjs('2023-06-02').toISOString(),
            I03: 'Memento',
            I08: null,
            I09: null,
          },
          {
            dossierId: 10,
            I01: 'W00000010',
            I02: dayjs('2023-06-06').toISOString(),
            I03: 'Premier Contact',
            I08: [17400, 8600, 19200, 15600, 23000],
            I09: ['USA', 'Écosse', 'Turquie', 'France', 'Qatar'],
          },
          {
            dossierId: 9,
            I01: 'W00000009',
            I02: dayjs('2023-06-13').toISOString(),
            I03: 'Telma & Louise',
            I08: null,
            I09: null,
          },
        ])
      })
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
    {
      filterType: 'date',
      condition1: {
        type: 'greaterThan',
        filter: 't0to',
      },
    },
    {
      filterType: 'date',
      condition1: {
        type: 'GreaterThan',
        filter: '2024-01-12T11:37:54.000Z',
      },
    },
    {
      filterType: 'date',
      condition1: {
        type: 'since',
        filter: 'ThreeWeeks',
      },
    },
  ]

  badFilters.forEach((badFilter, i) => {
    it(`Should return 400 if filter is incorrect (p-${i})`, () => {
      return request(app.getHttpServer())
        .post('/demarches/1/dossiers-search')
        .send({
          columns: ['I01', 'I02', 'I03'],
          filters: { I01: badFilter },
        })
        .set('Cookie', [cookies.superadmin])
        .expect(400)
    })
  })

  it('Should only return dossier with pays=Qatar', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
        filters: {
          I09: {
            filterType: 'text',
            condition1: {
              type: 'contains',
              filter: 'atar',
            },
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .then(({ body }) => {
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I03: 'Avenger',
            I08: [16400, 16400],
            I09: ['Qatar', 'Turquie'],
            I01: 'W00000001',
            I02: dayjs('2023-06-01').toISOString(),
          },
          {
            dossierId: 5,
            I03: 'Captain Fantastic',
            I08: [23000, 6400, 2500],
            I09: ['USA', 'Qatar', 'France'],
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
          },
          {
            dossierId: 7,
            I03: 'Barbie',
            I08: [6400, 2500],
            I09: ['Qatar', 'USA'],
            I01: 'W00000007',
            I02: dayjs('2023-06-04').toISOString(),
          },
          {
            dossierId: 10,
            I03: 'Premier Contact',
            I08: [17400, 8600, 19200, 15600, 23000],
            I09: ['USA', 'Écosse', 'Turquie', 'France', 'Qatar'],
            I01: 'W00000010',
            I02: dayjs('2023-06-06').toISOString(),
          },
        ])
      })
  })

  it('Should only return dossier with pays=Qatar AND 10000 > financement > 20000', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
        filters: {
          I09: {
            filterType: 'text',
            condition1: {
              type: 'contains',
              filter: 'atar',
            },
          },
          I08: {
            filterType: 'number',
            condition1: {
              type: 'greaterThan',
              filter: 10000,
            },
            condition2: {
              type: 'lessThan',
              filter: 20000,
            },
            operator: 'AND',
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .then(({ body }) => {
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I08: [16400, 16400],
            I09: ['Qatar', 'Turquie'],
            I03: 'Avenger',
            I01: 'W00000001',
            I02: (dayjs('2023-06-01')).toISOString(),
          },
          {
            dossierId: 5,
            I08: [23000, 6400, 2500],
            I09: ['USA', 'Qatar', 'France'],
            I03: 'Captain Fantastic',
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
          },
          {
            dossierId: 10,
            I08: [17400, 8600, 19200, 15600, 23000],
            I09: ['USA', 'Écosse', 'Turquie', 'France', 'Qatar'],
            I03: 'Premier Contact',
            I01: 'W00000010',
            I02: dayjs('2023-06-06').toISOString(),
          },
        ])
      })
  })

  it('Should only return dossier with etat = instruction', async () => {
    await request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I05'],
        filters: {
          I05: {
            filterType: 'set',
            condition1: {
              filter: ['instruction'],
            },
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .then(({ body }) => {
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I01: 'W00000001',
            I05: 'instruction',
          },
          {
            dossierId: 4,
            I01: 'W00000004',
            I05: 'instruction',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I05: 'instruction',
          },
          {
            dossierId: 7,
            I01: 'W00000007',
            I05: 'instruction',
          },
          {
            dossierId: 10,
            I01: 'W00000010',
            I05: 'instruction',
          },
        ])
      })
    await request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I05'],
        filters: {
          I05: {
            filterType: 'set',
            condition1: {
              filter: ['instruction', 'valide'],
            },
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .then(({ body }) => {
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I05: 'instruction',
          },
          {
            dossierId: 2,
            I05: 'valide',
          },
          {
            dossierId: 3,
            I05: 'valide',
          },
          {
            dossierId: 4,
            I05: 'instruction',
          },
          {
            dossierId: 5,
            I05: 'instruction',
          },
        ])
      })
  })
})
