import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { dataSource } from '../data-source-e2e.typeorm'
import { Cookies, TestingModuleFactory } from '../common/testing-module.factory'
import { PaginationDto } from '@biblio-num/shared'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'

// those object matches fixtures
const renault = {
  id: 2,
  type: 'FRUP',
  title: 'Renault',
  email: null,
  phoneNumber: null,
  dateCreation: '2023-10-04',
  dateDissolution: null,
  idRna: null,
  rnaJson: null,
  idRnf: 'F001',
  rnfJson: null,
  addressLabel: '5 Rue du Temple 75004 Paris',
  addressPostalCode: '75004',
  addressCityName: 'Paris',
  addressType: 'housenumber',
  addressStreetAddress: '5 Rue du Temple',
  addressStreetNumber: '5',
  addressStreetName: 'Rue du Temple',
  addressDepartmentName: 'Paris',
  addressDepartmentCode: '75',
  addressRegionName: 'Île-de-France',
  addressRegionCode: '75',
}
const bmw = {
  id: 1,
  type: 'ARUP',
  title: 'Bmw',
  email: null,
  phoneNumber: null,
  dateCreation: '2023-10-04',
  dateDissolution: null,
  idRna: 'W001',
  rnaJson: null,
  idRnf: null,
  rnfJson: null,
  addressLabel: '4 Rue Judaïque 33000 Bordeaux',
  addressPostalCode: '33000',
  addressCityName: 'Bordeaux',
  addressType: 'housenumber',
  addressStreetAddress: '4 Rue Judaïque',
  addressStreetNumber: '4',
  addressStreetName: 'Rue Judaïque',
  addressDepartmentName: 'Gironde',
  addressDepartmentCode: '33',
  addressRegionName: 'Nouvelle-Aquitaine',
  addressRegionCode: '75',
}

describe('Organismes (e2e)', () => {
  let app: INestApplication
  let cookies: Cookies
  let organismeService: OrganismeService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    organismeService = await app.resolve(OrganismeService)
    cookies = testingModule.cookies
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  describe('GET /organismes/:id', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer()).get('/organismes/1').expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should give 404', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1234')
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })

    it('Should give 400', async () => {
      return request(app.getHttpServer())
        .get('/organismes/undefined')
        .set('Cookie', [cookies.instructor])
        .expect(400)
    })

    it('Should get an organisme', async () => {
      return request(app.getHttpServer())
        .get('/organismes/2')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject(renault)
        })
    })
  })

  describe('GET /organismes/rna/:id', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna/W001')
        .expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna/W001')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })

    it('Should give 404', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna/w1234')
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })

    it('Should give 400', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna')
        .set('Cookie', [cookies.instructor])
        .expect(400)
    })

    it('Should get an organisme', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna/W001')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject(bmw)
        })
    })
  })

  describe('GET /organismes/rnf/:id', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rnf/F001')
        .expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rnf/F001')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })
    it('Should give 404', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rnf/f1234')
        .set('Cookie', [cookies.instructor])
        .expect(404)
    })

    it('Should give 400', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rna')
        .set('Cookie', [cookies.instructor])
        .expect(400)
    })

    it('Should get an organisme', async () => {
      return request(app.getHttpServer())
        .get('/organismes/rnf/F001')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toMatchObject(renault)
        })
    })
  })

  describe('GET /organismes/:id/dossier', () => {
    it('Should give 401', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1/dossiers')
        .expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1/dossiers')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })
    it('Should give 400', async () => {
      return request(app.getHttpServer())
        .get('/organismes/undefined/dossiers')
        .set('Cookie', [cookies.instructor])
        .expect(400)
    })

    it('Should return no dossier', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1234/dossiers')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([])
        })
    })

    it('Should return 2 dossiers', async () => {
      return request(app.getHttpServer())
        .get('/organismes/1/dossiers')
        .set('Cookie', [cookies.instructor])
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([
            {
              demarcheTitle: 'Déclaration de financement étranger',
              depotDate: null,
              id: 12,
              prefecture: null,
              state: 'accepte',
            },
            {
              demarcheTitle: 'Déclaration de financement étranger',
              depotDate: null,
              id: 11,
              prefecture: null,
              state: 'accepte',
            },
          ])
        })
    })
  })

  describe('POST /organismes/list', () => {
    let numberOfOrganisme: number

    beforeAll(async () => {
      numberOfOrganisme = await organismeService.repository.count()
    })

    it('Should give 401', async () => {
      return request(app.getHttpServer()).post('/organismes/list').expect(401)
    })

    it('Should give 403', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.norole])
        .expect(403)
    })
    it('Should give title of organisme in order', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.instructor])
        .send({
          columns: ['title'],
        } as PaginationDto<Organisme>)
        .expect(200)
        .then(({ body }) => {
          expect(body.total).toEqual(numberOfOrganisme)
          expect(body.data).toMatchObject([
            { title: 'Bmw' },
            { title: 'Renault' },
            { title: 'Peugeot' },
            { title: 'Toyota' },
            { title: 'Honda' },
            { title: 'Ford' },
            { title: 'Nissan' },
            { title: 'Hyundai' },
            { title: 'Chevrolet' },
            { title: 'Subaru' },
          ])
        })
    })

    it('Should select correctly in pagination', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.instructor])
        .send({
          columns: ['title'],
        } as PaginationDto<Organisme>)
        .expect(200)
        .then(({ body }) => {
          expect(body.total).toEqual(numberOfOrganisme)
          expect(body.data).toMatchObject([
            { title: 'Bmw' },
            { title: 'Renault' },
            { title: 'Peugeot' },
            { title: 'Toyota' },
            { title: 'Honda' },
            { title: 'Ford' },
            { title: 'Nissan' },
            { title: 'Hyundai' },
            { title: 'Chevrolet' },
            { title: 'Subaru' },
          ])
        })
    })

    it('Should paginate correctly in pagination', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.instructor])
        .send({
          columns: ['title'],
          page: 2,
          perPage: 5,
        } as PaginationDto<Organisme>)
        .expect(200)
        .then(({ body }) => {
          expect(body.total).toEqual(numberOfOrganisme)
          expect(body.data).toMatchObject([
            { title: 'Ford' },
            { title: 'Nissan' },
            { title: 'Hyundai' },
            { title: 'Chevrolet' },
            { title: 'Subaru' },
          ])
        })
    })

    it('Should sort correctly in pagination', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.instructor])
        .send({
          columns: ['title'],
          sorts: [{ key: 'title', order: 'DESC' }],
          page: 2,
          perPage: 5,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.total).toEqual(numberOfOrganisme)
          expect(body.data).toMatchObject([
            { title: 'Hyundai' },
            { title: 'Honda' },
            { title: 'Ford' },
            { title: 'Chevrolet' },
            { title: 'Bmw' },
          ])
        })
    })

    it('Should filter correctly in pagination', async () => {
      return request(app.getHttpServer())
        .post('/organismes/list')
        .set('Cookie', [cookies.instructor])
        .send({
          columns: ['title'],
          filters: {
            title: {
              filterType: 'text',
              condition1: {
                type: 'contains',
                filter: 'h',
              },
              condition2: {
                type: 'contains',
                filter: 'w',
              },
              operator: 'OR',
            },
          },
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.total).toEqual(4)
          expect(body.data).toMatchObject([
            { title: 'Bmw' },
            { title: 'Honda' },
            { title: 'Hyundai' },
            { title: 'Chevrolet' },
          ])
        })
    })
  })
})
