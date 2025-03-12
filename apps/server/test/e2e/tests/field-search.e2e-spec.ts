import { INestApplication } from '@nestjs/common'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'
import * as request from 'supertest'
import * as dayjs from 'dayjs'

describe('Field search', () => {
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
      .post('/demarches/1/fields-search')
      .send({
        idDs: 42,
      })
      .expect(401)
  })

  it('Should return 403', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .set('Cookie', [cookies.norole])
      .send({
        idDs: 42,
      })
      .expect(403)
  })

  it('Should return 403 wrong demarche', () => {
    return request(app.getHttpServer())
      .post('/demarches/2/fields-search')
      .set('Cookie', [cookies.instructor])
      .send({
        idDs: 42,
      })
      .expect(403)
  })

  it('Should return 404 if demarche doesnt exist', () => {
    return request(app.getHttpServer())
      .get('/demarches/13847/fields-search')
      .set('Cookie', [cookies.superadmin])
      .expect(404)
  })

  it('Should return 400 if query is empty', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if page is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        page: -1,
        columns: ['I01', 'I02', 'I03'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if perPage is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        perPage: 500,
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should return 400 if sorts is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        sorts: [{ toto: 'I03', order: 'ASC' }],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(400)
  })

  it('Should Paginate correctly with default options', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03', 'I09'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I01: 'W00000001',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Avenger',
            I09: 'Qatar',
          },
          {
            dossierId: 1,
            I01: 'W00000001',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Avenger',
            I09: 'Turquie',
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
            I09: 'Écosse',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: dayjs('2023-06-04').toISOString(),
            I03: 'Dune',
            I09: 'USA',
          },
        ])
      })
  })

  it('Should Paginate correctly with pagination', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 4,
            I01: 'W00000004',
            I02: dayjs('2023-06-02').toISOString(),
            I03: 'Memento',
            I08: null,
            I09: null,
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Captain Fantastic',
            I08: 23000,
            I09: 'France',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Captain Fantastic',
            I08: 2500,
            I09: 'Qatar',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Captain Fantastic',
            I08: 6400,
            I09: 'USA',
          },
          {
            dossierId: 6,
            I01: 'W00000006',
            I02: dayjs('2023-06-02').toISOString(),
            I03: "Ender's game",
            I08: 8800,
            I09: 'Turquie',
          },
        ])
      })
  })

  it('Should Paginate correctly with sort (by title)', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
        sorts: [{ key: 'I03', order: 'ASC' }],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Captain Fantastic',
            I08: 23000,
            I09: 'France',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: dayjs('2023-06-01').toISOString(),
            I03: 'Captain Fantastic',
            I08: 2500,
            I09: 'Qatar',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: dayjs('2023-06-04').toISOString(),
            I03: 'Dune',
            I08: 12600,
            I09: 'USA',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: dayjs('2023-06-04').toISOString(),
            I03: 'Dune',
            I08: 5800,
            I09: 'Écosse',
          },
          {
            dossierId: 6,
            I01: 'W00000006',
            I02: dayjs('2023-06-02').toISOString(),
            I03: "Ender's game",
            I08: 8800,
            I09: 'Turquie',
          },
        ])
      })
  })

  it('Should only return dossier with pays=Qatar', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
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
        expect(body).toEqual({
          total: 4,
          data: [
            {
              dossierId: 1,
              I01: 'W00000001',
              I02: dayjs('2023-06-01').toISOString(),
              I03: 'Avenger',
              I08: 16400,
              I09: 'Qatar',
            },
            {
              dossierId: 5,
              I01: 'W00000005',
              I02: dayjs('2023-06-01').toISOString(),
              I03: 'Captain Fantastic',
              I08: 2500,
              I09: 'Qatar',
            },
            {
              dossierId: 7,
              I01: 'W00000007',
              I02: dayjs('2023-06-04').toISOString(),
              I03: 'Barbie',
              I08: 2500,
              I09: 'Qatar',
            },
            {
              dossierId: 10,
              I01: 'W00000010',
              I02: dayjs('2023-06-06').toISOString(),
              I03: 'Premier Contact',
              I08: 23000,
              I09: 'Qatar',
            },
          ],
        })
      })
  })

  it('Should only return dossier with pays=Qatar AND 10000 > financement > 20000', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
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
        expect(body).toEqual({
          total: 1,
          data: [
            {
              dossierId: 1,
              I01: 'W00000001',
              I02: dayjs('2023-06-01').toISOString(),
              I03: 'Avenger',
              I08: 16400,
              I09: 'Qatar',
            },
          ],
        })
      })
  })

  it('Should only return dossiers with instruction times empty', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/demarches/9/fields-search')
      .send({
        columns: ['I11'],
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)

    expect(body).toMatchObject({
      total: 2,
      data: expect.arrayContaining([
        expect.objectContaining({ I11: '' }),
        expect.objectContaining({ I11: 'Erreur' }),
      ]),
    })
  })

  it('Should only return dossiers with filter empty value for enum', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/demarches/9/fields-search')
      .send({
        columns: ['I11'],
        filters: {
          I11: {
            condition1: {
              filter: [
                null,
              ],
            },
            filterType: 'set',
          },
        },
      })
      .set('Cookie', [cookies.superadmin])
      .expect(200)

    expect(body).toMatchObject({
      total: 1,
      data: expect.arrayContaining([
        expect.objectContaining({ I11: '' }),
      ]),
    })
  })
})
