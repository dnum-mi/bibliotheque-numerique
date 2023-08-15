import { INestApplication } from '@nestjs/common'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'
import * as request from 'supertest';
import { getAdminCookie } from '../common/get-admin-cookie';

describe('Dossier listing', () => {
  let app: INestApplication
  let adminCookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    adminCookie = await getAdminCookie(app);
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it("shoud return 403 if not connected", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        idDs: 42,
      })
      .expect(403)
  });

  it("shoud return 404 if demarche doesnt exist", () => {
    return request(app.getHttpServer())
      .get('/demarches/13847/dossiers-search')
      .set('Cookie', [adminCookie])
      .expect(404)
  });

  it("Should return 400 if query is empty", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .set('Cookie', [adminCookie])
      .expect(400)
  });

  it("Should return 400 if page is incorrect", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: -1,
        columns: ['I01', 'I02', 'I03'],
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  });

  it("Should return 400 if perPage is incorrect", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        perPage: 500,
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  });

  it("Should return 400 if sorts is incorrect", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03'],
        sorts: [{toto: 'I03', order: 'ASC'}],
      })
      .set('Cookie', [adminCookie])
      .expect(400)
  });

  it("Should Paginate correctly with default options", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        columns: ['I01', 'I02', 'I03', 'I09'],
      })
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(10);
        expect(body.data.length).toEqual(5);
        expect(body.data).toEqual(
          [
            {
              dossier_id: 1,
              identifiant: 'W00000001',
              moment: '01/06/2023',
              titre: 'Avenger',
              pays: [ 'Qatar', 'Turquie' ]
            },
            {
              dossier_id: 2,
              identifiant: 'W00000002',
              moment: '03/06/2023',
              titre: 'Interstellar',
              pays: null
            },
            {
              dossier_id: 3,
              identifiant: 'W00000003',
              moment: '04/06/2023',
              titre: 'Dune',
              pays: [ 'USA', 'Écosse' ]
            },
            {
              dossier_id: 4,
              identifiant: 'W00000004',
              moment: '02/06/2023',
              titre: 'Memento',
              pays: null
            },
            {
              dossier_id: 5,
              identifiant: 'W00000005',
              moment: '01/06/2023',
              titre: 'Captain Fantastic',
              pays: [ 'USA', 'Qatar', 'France']
            }
          ]
        )
      })
  });

  it("Should Paginate correctly with pagination", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
      })
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(10);
        expect(body.data.length).toEqual(5);
        expect(body.data).toEqual(
          [
            {
              dossier_id: 6,
              identifiant: 'W00000006',
              moment: '02/06/2023',
              titre: "Ender's game",
              montant: '8800',
              pays: 'Turquie'
            },
            {
              dossier_id: 7,
              identifiant: 'W00000007',
              moment: '04/06/2023',
              titre: 'Barbie',
              montant: [ '6400', '2500' ],
              pays: [ 'Qatar', 'USA' ]
            },
            {
              dossier_id: 8,
              identifiant: 'W00000002',
              moment: '03/06/2023',
              titre: "L'homme invisible",
              montant: null,
              pays: null
            },
            {
              dossier_id: 9,
              identifiant: 'W00000009',
              moment: '13/06/2023',
              titre: 'Telma & Louise',
              montant: null,
              pays: null
            },
            {
              dossier_id: 10,
              identifiant: 'W00000010',
              moment: '06/06/2023',
              titre: 'Premier Contact',
              montant: [ '17400', '8600', '19200', '15600', '23000' ],
              pays: [ 'USA', 'Écosse', 'Turquie', 'France', 'Qatar' ]
            }
          ]
        )
      })
  });

  it("Should Paginate correctly with sort (by title)", () => {
    return request(app.getHttpServer())
      .post('/demarches/1/dossiers-search')
      .send({
        page: 2,
        perPage: 5,
        columns: ['I01', 'I02', 'I03', 'I08', 'I09'],
        sorts: [{key: 'I03', order: 'ASC'}],
      })
      .set('Cookie', [adminCookie])
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toEqual(10);
        expect(body.data.length).toEqual(5);
        expect(body.data).toEqual(
          [
            {
              dossier_id: 2,
              identifiant: 'W00000002',
              moment: '03/06/2023',
              titre: 'Interstellar',
              montant: null,
              pays: null
            },
            {
              dossier_id: 8,
              identifiant: 'W00000002',
              moment: '03/06/2023',
              titre: "L'homme invisible",
              montant: null,
              pays: null
            },
            {
              dossier_id: 4,
              identifiant: 'W00000004',
              moment: '02/06/2023',
              titre: 'Memento',
              montant: null,
              pays: null
            },
            {
              dossier_id: 10,
              identifiant: 'W00000010',
              moment: '06/06/2023',
              titre: 'Premier Contact',
              montant: [ '17400', '8600', '19200', '15600', '23000' ],
              pays: [ 'USA', 'Écosse', 'Turquie', 'France', 'Qatar' ]
            },
            {
              dossier_id: 9,
              identifiant: 'W00000009',
              moment: '13/06/2023',
              titre: 'Telma & Louise',
              montant: null,
              pays: null
            }
          ]
        )
      })
  });
})
