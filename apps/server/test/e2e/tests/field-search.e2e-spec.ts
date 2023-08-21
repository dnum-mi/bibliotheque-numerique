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
            identifiant: 'W00000001',
            moment: '01/06/2023',
            titre: 'Avenger',
            pays: 'Qatar',
          },
          {
            dossierId: 1,
            identifiant: 'W00000001',
            moment: '01/06/2023',
            titre: 'Avenger',
            pays: 'Turquie',
          },
          {
            dossierId: 2,
            identifiant: 'W00000002',
            moment: '03/06/2023',
            titre: 'Interstellar',
            pays: null,
          },
          {
            dossierId: 3,
            identifiant: 'W00000003',
            moment: '04/06/2023',
            titre: 'Dune',
            pays: 'Écosse',
          },
          {
            dossierId: 3,
            identifiant: 'W00000003',
            moment: '04/06/2023',
            titre: 'Dune',
            pays: 'USA',
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
            identifiant: 'W00000004',
            moment: '02/06/2023',
            titre: 'Memento',
            montant: null,
            pays: null,
          },
          {
            dossierId: 5,
            identifiant: 'W00000005',
            moment: '01/06/2023',
            titre: 'Captain Fantastic',
            montant: '23000',
            pays: 'France',
          },
          {
            dossierId: 5,
            identifiant: 'W00000005',
            moment: '01/06/2023',
            titre: 'Captain Fantastic',
            montant: '2500',
            pays: 'Qatar',
          },
          {
            dossierId: 5,
            identifiant: 'W00000005',
            moment: '01/06/2023',
            titre: 'Captain Fantastic',
            montant: '6400',
            pays: 'USA',
          },
          {
            dossierId: 6,
            identifiant: 'W00000006',
            moment: '02/06/2023',
            titre: "Ender's game",
            montant: '8800',
            pays: 'Turquie',
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
            identifiant: 'W00000005',
            moment: '01/06/2023',
            titre: 'Captain Fantastic',
            montant: '23000',
            pays: 'France',
          },
          {
            dossierId: 5,
            identifiant: 'W00000005',
            moment: '01/06/2023',
            titre: 'Captain Fantastic',
            montant: '2500',
            pays: 'Qatar',
          },
          {
            dossierId: 3,
            identifiant: 'W00000003',
            moment: '04/06/2023',
            titre: 'Dune',
            montant: '12600',
            pays: 'USA',
          },
          {
            dossierId: 3,
            identifiant: 'W00000003',
            moment: '04/06/2023',
            titre: 'Dune',
            montant: '5800',
            pays: 'Écosse',
          },
          {
            dossierId: 6,
            identifiant: 'W00000006',
            moment: '02/06/2023',
            titre: "Ender's game",
            montant: '8800',
            pays: 'Turquie',
          },
        ])
      })
  })
})
