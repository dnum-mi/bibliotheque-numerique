import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'
import * as request from 'supertest'
import { getAdminCookie } from '../common/get-admin-cookie'

describe('Field search', () => {
  let app: INestApplication
  let adminCookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    adminCookie = await getAdminCookie(app)
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it('shoud return 403 if not connected', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        idDs: 42,
      })
      .expect(403)
  })

  it('shoud return 404 if demarche doesnt exist', () => {
    return request(app.getHttpServer()).get('/demarches/13847/fields-search').set('Cookie', [adminCookie]).expect(404)
  })

  it('Should return 400 if query is empty', () => {
    return request(app.getHttpServer()).post('/demarches/1/fields-search').set('Cookie', [adminCookie]).expect(400)
  })

  it('Should return 400 if page is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        page: -1,
        columns: ['I01', 'I02', 'I03'],
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  })

  it('Should return 400 if perPage is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        perPage: 500,
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  })

  it('Should return 400 if sorts is incorrect', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        sorts: [{ toto: 'I03', order: 'ASC' }],
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  })

  it('Should Paginate correctly with default options', () => {
    return request(app.getHttpServer())
      .post('/demarches/1/fields-search')
      .send({
        columns: ['I01', 'I02', 'I03', 'I09'],
      })
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 1,
            I01: 'W00000001',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Avenger',
            I09: 'Qatar',
          },
          {
            dossierId: 1,
            I01: 'W00000001',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Avenger',
            I09: 'Turquie',
          },
          {
            dossierId: 2,
            I01: 'W00000002',
            I02: '2023-06-02T22:00:00.000Z',
            I03: 'Interstellar',
            I09: null,
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: '2023-06-03T22:00:00.000Z',
            I03: 'Dune',
            I09: 'Écosse',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: '2023-06-03T22:00:00.000Z',
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
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 4,
            I01: 'W00000004',
            I02: '2023-06-01T22:00:00.000Z',
            I03: 'Memento',
            I08: null,
            I09: null,
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Captain Fantastic',
            I08: 23000,
            I09: 'France',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Captain Fantastic',
            I08: 2500,
            I09: 'Qatar',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Captain Fantastic',
            I08: 6400,
            I09: 'USA',
          },
          {
            dossierId: 6,
            I01: 'W00000006',
            I02: '2023-06-01T22:00:00.000Z',
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
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(19)
        expect(body.data.length).toEqual(5)
        expect(body.data).toEqual([
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Captain Fantastic',
            I08: 23000,
            I09: 'France',
          },
          {
            dossierId: 5,
            I01: 'W00000005',
            I02: '2023-05-31T22:00:00.000Z',
            I03: 'Captain Fantastic',
            I08: 2500,
            I09: 'Qatar',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: '2023-06-03T22:00:00.000Z',
            I03: 'Dune',
            I08: 12600,
            I09: 'USA',
          },
          {
            dossierId: 3,
            I01: 'W00000003',
            I02: '2023-06-03T22:00:00.000Z',
            I03: 'Dune',
            I08: 5800,
            I09: 'Écosse',
          },
          {
            dossierId: 6,
            I01: 'W00000006',
            I02: '2023-06-01T22:00:00.000Z',
            I03: "Ender's game",
            I08: 8800,
            I09: 'Turquie',
          },
        ])
      })
  })
})
