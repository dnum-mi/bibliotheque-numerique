import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { testingModuleFactory } from '../testing-module.factory'
import { insertDumbFoundation } from './tools'

const createFoundationDtoFromDossier17 = {
  title:
    'Je suis un titre compliqué avec des espaces et des accents et des MajUsCules',
  type: 'FDD',
  department: '33',
  address: {
    label: '11 Rue Pelleport 33800 Bordeaux',
    type: 'housenumber',
    streetAddress: '11 Rue Pelleport',
    streetNumber: '11',
    streetName: 'Rue Pelleport',
    postalCode: '33800',
    cityName: 'Bordeaux',
    cityCode: '33063',
    departmentName: 'Gironde',
    departmentCode: '33',
    regionName: 'Nouvelle-Aquitaine',
    regionCode: '33',
  },
  email: 'tata@gmail.com',
  phone: '+33686465445',
}

const checkCollisionResponse =
  (df) =>
    ({
      body,
      body: {
        data,
        data: {
          collisionFoundations: [firstFoundation],
          currentFoundation,
        },
      },
    }) => {
      expect(body).toBeDefined()
      expect(data).toBeDefined()
      expect(data.collisionFoundations).toBeDefined()
      expect(currentFoundation).toBeDefined()
      expect(firstFoundation).toBeDefined()
      expect(firstFoundation.rnfId).toEqual(df.rnfId)
      expect(currentFoundation).toMatchObject(createFoundationDtoFromDossier17)
    }

describe('Foundation Controller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    ({ app, prisma } = await testingModuleFactory())
  })

  beforeEach(async () => {
    await prisma.foundation.deleteMany({})
    await prisma.$executeRaw`ALTER SEQUENCE "Foundation_id_seq" RESTART WITH 1;`
    await prisma.address.deleteMany({})
    await prisma.$executeRaw`ALTER SEQUENCE "Address_id_seq" RESTART WITH 1;`
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  describe('POST /foundations', () => {
    it('Should return 400 if no dossierId provided', () => {
      return request(app.getHttpServer())
        .post('/api/foundations')
        .expect(400)
        .expect({
          statusCode: 400,
          message:
            'Validation error(s):\n Champ dossierId: dossierId should not be null or undefined, dossierId must not be less than 0' +
            ', dossierId must be a number conforming to the specified constraints\n' +
            'Champ email: email should not be null or undefined, email must be an email',
          data: {},
          path: '/api/foundations',
        })
    })

    it('Should return 424 if dossierId provided is wrong', () => {
      return request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 42,
          email: 'toto@gmail.com',
        })
        .expect(424)
        .expect({
          statusCode: 424,
          message: 'GraphQL Error from DS-API.',
          data: {},
          path: '/api/foundations',
        })
    })

    it('Should return 400 if dossierId has not the right demarche', () => {
      return request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 37,
          email: 'yoyo@gmail.com',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'This demarche id is not implemented',
          data: {},
          path: '/api/foundations',
        })
    })

    it('Should return 403 if email provided is wrong', () => {
      return request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 37,
          email: 'fake@gmail.com',
        })
        .expect(403)
        .expect({
          statusCode: 403,
          message: "This instructeur's email is not linked to this dossier.",
          data: {},
          path: '/api/foundations',
        })
    })

    it('Should create a new foundation with dotation', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .expect(201)
      expect(result.body).toEqual({
        rnfId: '033-FDD-00001-02',
        ds: {
          dossierId: 17,
          demarcheId: 37,
        },
      })
      await prisma.foundation
        .findFirst({
          where: { rnfId: '033-FDD-00001-02' },
          include: { address: true },
        })
        .then((a) => {
          expect(a).toMatchObject({
            id: 1,
            rnfId: '033-FDD-00001-02',
            type: 'FDD',
            department: '33',
            title:
              'Je suis un titre compliqué avec des espaces et des accents et des MajUsCules',
            addressId: 1,
            phone: '+33686465445',
            email: 'tata@gmail.com',
            address: {
              id: 1,
              label: '11 Rue Pelleport 33800 Bordeaux',
              type: 'housenumber',
              streetAddress: '11 Rue Pelleport',
              streetNumber: '11',
              streetName: 'Rue Pelleport',
              postalCode: '33800',
              cityName: 'Bordeaux',
              cityCode: '33063',
              departmentName: 'Gironde',
              departmentCode: '33',
              regionName: 'Nouvelle-Aquitaine',
              regionCode: '33',
            },
          })
        })
    })

    it('Should create a new foundation with entreprise', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 65,
          email: 'titi@gmail.com',
        })
        .expect(201)
      expect(result.body).toEqual({
        rnfId: '059-FE-00001-04',
        ds: {
          demarcheId: 12,
          dossierId: 65,
        },
      })
      await prisma.foundation
        .findFirst({
          where: { rnfId: '059-FE-00001-04' },
          include: { address: true },
        })
        .then((a) => {
          expect(a).toMatchObject({
            id: 1,
            rnfId: '059-FE-00001-04',
            type: 'FE',
            department: '59',
            title: 'Test demo',
            addressId: 1,
            address: {
              id: 1,
              label: '1 Square Wannoschot 59800 Lille',
              type: 'housenumber',
              streetAddress: '1 Square Wannoschot',
              streetNumber: '1',
              streetName: 'Square Wannoschot',
              postalCode: '59800',
              cityName: 'Lille',
              cityCode: '59350',
              departmentName: 'Nord',
              departmentCode: '59',
              regionName: 'Hauts-de-France',
              regionCode: '32',
            },
            fiscalEndDateAt: new Date('2023-09-08'),
          })
        })
    })

    it('Should create a new foundation with public utility', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 321,
          email: 'tito@gmail.com',
        })
        .expect(201)
      expect(result.body).toEqual({
        rnfId: '059-FRUP-00001-08',
        ds: {
          demarcheId: 70,
          dossierId: 321,
        },
      })
      await prisma.foundation
        .findFirst({
          where: { rnfId: '059-FRUP-00001-08' },
          include: { address: true },
        })
        .then((a) => {
          expect(a).toMatchObject({
            id: 1,
            rnfId: '059-FRUP-00001-08',
            type: 'FRUP',
            department: '59',
            title: 'Test demo',
            addressId: 1,
            address: {
              id: 1,
              label: '1 Square Wannoschot 59800 Lille',
              type: 'housenumber',
              streetAddress: '1 Square Wannoschot',
              streetNumber: '1',
              streetName: 'Square Wannoschot',
              postalCode: '59800',
              cityName: 'Lille',
              cityCode: '59350',
              departmentName: 'Nord',
              departmentCode: '59',
              regionName: 'Hauts-de-France',
              regionCode: '32',
            },
            fiscalEndDateAt: new Date('2023-09-08'),
            originalCreatedAt: new Date('2023-09-13'),
          })
        })
    })

    it('Should create a new foundation with demande numéro rnf', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 135,
          email: 'jojo@gmail.com',
        })
        .expect(201)
      expect(result.body).toEqual({
        rnfId: '059-FRUP-00001-08',
        ds: {
          demarcheId: 43,
          dossierId: 135,
        },
      })
      await prisma.foundation
        .findFirst({
          where: { rnfId: '059-FRUP-00001-08' },
          include: { address: true },
        })
        .then((a) => {
          expect(a).toMatchObject({
            id: 1,
            title: 'Fondation des tulipes',
            type: 'FRUP',
            address: {
              label: '3 Rue Colbert 59800 Lille',
              type: 'housenumber',
              streetAddress: '3 Rue Colbert',
              streetNumber: '3',
              streetName: 'Rue Colbert',
              postalCode: '59800',
              cityName: 'Lille',
              cityCode: '59350',
              departmentName: 'Nord',
              departmentCode: '59',
              regionName: 'Hauts-de-France',
              regionCode: '32',
            },
            email: 'tulipe@gmail.com',
            phone: '+33789898989',
          })
        })
    })
  })

  describe('POST /foundations (collisions)', () => {
    it('Should return a 409 if phone already exists', async () => {
      const df = await insertDumbFoundation(prisma, { phone: '+33686465445' })
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .expect(409)
        .then(checkCollisionResponse(df))
    })

    it('Should return a 409 if email already exists', async () => {
      const df = await insertDumbFoundation(prisma, { email: 'tata@gmail.com' })
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .expect(409)
        .then(checkCollisionResponse(df))
    })

    it('Should return a 409 if address already exists', async () => {
      const df = await insertDumbFoundation(prisma, {
        // @ts-expect-error not really important in test context
        address: {
          create: {
            label: '11 Rue Pelleport 33800 Bordeaux',
            type: 'housenumber',
            streetAddress: '11 Rue Pelleport',
            streetNumber: '11',
            streetName: 'Rue Pelleport',
            postalCode: '33800',
            cityName: 'Bordeaux',
            cityCode: '33063',
            departmentName: 'Gironde',
            departmentCode: '33',
            regionName: 'Nouvelle-Aquitaine',
            regionCode: '33',
          },
        },
      })
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .expect(409)
        .then(checkCollisionResponse(df))
    })

    it('Should return a 409 if title is similar', async () => {
      // Same title but no space, no maj and TWO different letters
      await insertDumbFoundation(prisma, {
        title: 'jesuisuntitrecmpliquéavecdesespacesetdesaccentsetdesmajusules',
      })
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .expect(409)
    })

    it('Should not be susceptible to SQL injection', async () => {
      // Same title but no space, no maj and TWO different letters
      await insertDumbFoundation(prisma)
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 500,
          email: 'toto@gmail.com',
        })
        .expect(409)
    })

    it('Should create EVEN if collision', async () => {
      await insertDumbFoundation(prisma, { phone: '+33686 46 5445' })
      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
        })
        .then(res => {
          console.log(res)
          expect(res.statusCode).toBe(409)
        })
        //  .expect(409)

      await request(app.getHttpServer())
        .post('/api/foundations')
        .send({
          dossierId: 17,
          email: 'toto@gmail.com',
          forceCreate: true,
        })
        .expect(201)
      await prisma.foundation.count().then((count) => {
        expect(count).toEqual(2)
      })
      await prisma.foundation.findMany({}).then((fs) => {
        expect(fs[1].rnfId).toEqual('033-FDD-00002-08')
      })
    })
  })

  describe('GET /foundations/rnf-id', () => {
    it('Should return 400 for wrong rnf', async () => {
      return await request(app.getHttpServer())
        .get('/api/foundations/toto')
        .expect(400)
        .expect({
          statusCode: 400,
          message:
            "Validation error(s):\n Champ rnfId: Le numéro RNF n'est pas valide",
          data: {},
          path: '/api/foundations/toto',
        })
    })

    it('Should return 404 for not existing rnf', async () => {
      return await request(app.getHttpServer())
        .get('/api/foundations/059-FE-000002-04')
        .expect(404)
        .expect({
          statusCode: 404,
          data: {},
          message: 'Foundation with rnfId 059-FE-000002-04 not found',
          path: '/api/foundations/059-FE-000002-04',
        })
    })

    it('Should return 200 with correct foundation', async () => {
      await prisma.foundation.create({
        data: {
          rnfId: '033-FDD-000001-06',
          type: 'FDD',
          department: '33',
          title: 'Héritage',
          phone: '06 86 46 54 45',
          email: 'straydine.aiguadel-jaleme@interieur.gouv.fr',
          address: {
            create: {
              label: '11 Rue Pelleport 33800 Bordeaux',
              type: 'housenumber',
              streetAddress: '11 Rue Pelleport',
              streetNumber: '11',
              streetName: 'Rue Pelleport',
              postalCode: '33800',
              cityName: 'Bordeaux',
              cityCode: '33063',
              departmentName: 'Gironde',
              departmentCode: '33',
              regionName: 'Nouvelle-Aquitaine',
              regionCode: '75',
            },
          },
        },
      })
      await prisma.foundation.create({
        data: {
          rnfId: '059-FE-000002-04',
          type: 'FE',
          department: '59',
          title: 'Test demo',
          phone: '06 86 46 54 45',
          email: 'straydine.aiguadel-jaleme@interieur.gouv.fr',
          address: {
            create: {
              label: '1 Square Wannoschot 59800 Lille',
              type: 'housenumber',
              streetAddress: '1 Square Wannoschot',
              streetNumber: '1',
              streetName: 'Square Wannoschot',
              postalCode: '59800',
              cityName: 'Lille',
              cityCode: '59350',
              departmentName: 'Nord',
              departmentCode: '59',
              regionName: 'Hauts-de-France',
              regionCode: '32',
            },
          },
        },
      })
      const result = await request(app.getHttpServer())
        .get('/api/foundations/033-FDD-000001-06')
        .expect(200)
      expect(result.body).toMatchObject({
        id: 1,
        rnfId: '033-FDD-000001-06',
        type: 'FDD',
        department: '33',
        title: 'Héritage',
        phone: '06 86 46 54 45',
        email: 'straydine.aiguadel-jaleme@interieur.gouv.fr',
        address: {
          label: '11 Rue Pelleport 33800 Bordeaux',
          type: 'housenumber',
          streetAddress: '11 Rue Pelleport',
          streetNumber: '11',
          streetName: 'Rue Pelleport',
          postalCode: '33800',
          cityName: 'Bordeaux',
          cityCode: '33063',
          departmentName: 'Gironde',
          departmentCode: '33',
          regionName: 'Nouvelle-Aquitaine',
          regionCode: '75',
        },
      })
      const date = new Date(result.body.createdAt || '')
      const date2 = new Date(result.body.updatedAt || '')
      expect(date.getTime()).toEqual(date2.getTime())
      expect(date.getTime()).toBeCloseTo(new Date().getTime(), -3)
    })
  })

  describe('POST /foundations/last-updated-list', () => {
    it('Should return 400 if bad argument', async () => {
      return request(app.getHttpServer())
        .post('/api/foundations/last-updated-list')
        .expect(400)
    })

    it('Should get list fondation', async () => {
      await insertDumbFoundation(prisma, {
        rnfId: '033-FDD-00002-08',
        updatedAt: new Date('2023-06-01'),
      })
      await insertDumbFoundation(prisma, { rnfId: '033-FDD-000001-06' })
      const { body: fondations } = await request(app.getHttpServer())
        .post('/api/foundations/last-updated-list')
        .send({
          rnfIds: ['033-FDD-00002-08', '033-FDD-000001-06'],
          lastUpdatedAt: new Date('2023-06-02'),
        })
        .expect(200)

      expect(fondations).toHaveLength(1)
      expect(fondations[0]).toEqual('033-FDD-000001-06')
    })
  })
})
