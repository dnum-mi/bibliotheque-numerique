import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { testingModuleFactory } from '../testing-module.factory'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import {
  demarcheDossierEntrepriseModificationNewTitle,
  demarcheDossierEntrepriseModificationRnfId,
} from '../../mocks/datas/demarche-dossier-entreprise-modification.data.mock'
import { insertDumbFoundation } from './tools'
import {
  demarcheDossierEntrepriseDissolutionRnfId,
} from '../../mocks/datas/demarche-dossier-entreprise-dissolution.mock'
import {
  demarcheDossierEntrepriseAdministrationChangesRnfId,
} from '../../mocks/datas/demarche-dossier-entreprise-administration-changes.data.mock'

describe('Ds Controller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    ({ app, prisma } = await testingModuleFactory())
  })

  beforeEach(async () => {
    await prisma.foundation.deleteMany({})
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  describe('/ds', () => {
    it('GET /url - Should return DS url', async () => {
      return await request(app.getHttpServer())
        .get('/api/ds/url')
        .expect(200)
        .expect({
          url: 'no-url-for-e2e-test',
        })
    })

    it('GET /callback - Should return DS url', async () => {
      return await request(app.getHttpServer())
        .get('/api/ds/url')
        .expect(200)
        .expect({
          url: 'no-url-for-e2e-test',
        })
    })
  })

  describe('/ds-configuration', () => {
    describe('GET /', () => {
      it('Should return 403', async () => {
        return await request(app.getHttpServer())
          .get('/api/ds-configuration')
          .expect(403)
      })

      it('Should return configuration', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ds-configuration')
          .set('x-admin-token', 'e2e-test-admin-password')
          .expect(200)
        expect(response.body.dsDemarcheFDDCreationId).toBeDefined()
      })
    })

    describe('PATCH /', () => {
      it('PATCH - Should return 400', async () => {
        const updateData = {
          dsDemarcheFDDCreationId: 'coucou',
        }

        await request(app.getHttpServer())
          .patch('/api/ds-configuration')
          .set('x-admin-token', 'e2e-test-admin-password') // Remplace par le bon mot de passe
          .send({ dto: updateData })
          .expect(400)
      })

      it('PATCH - Should update configuration', async () => {
        const updateData = {
          dsDemarcheFDDCreationId: 12345,
        }

        await request(app.getHttpServer())
          .patch('/api/ds-configuration')
          .set('x-admin-token', 'e2e-test-admin-password') // Remplace par le bon mot de passe
          .send({ dto: updateData })
          .expect(200)

        const newConf = await prisma.dSConfiguration.findFirst()

        expect(newConf?.dsDemarcheFDDCreationId).toEqual(
          updateData.dsDemarcheFDDCreationId,
        )
        // put it back
        await prisma.dSConfiguration.update({
          where: { id: 1 },
          data: {
            dsDemarcheFDDCreationId: 37,
          },
        })
      })
    })

    describe('GET /trigger-refresh', () => {
      it('Should return 403', async () => {
        return await request(app.getHttpServer())
          .get('/api/ds-configuration/trigger-refresh')
          .expect(403)
      })

      it('feModification should update foundation', async () => {
        const rnfId = demarcheDossierEntrepriseModificationRnfId
        await insertDumbFoundation(prisma, {
          rnfId,
          title: 'some title',
          email: 'shouldNotChanged',
        })
        await request(app.getHttpServer())
          .get('/api/ds-configuration/trigger-refresh?type=feModification')
          .set('x-admin-token', 'e2e-test-admin-password')
          .expect(200)
        await prisma.foundation.findFirst({ where: { rnfId } }).then((f) => {
          expect(f?.title).toEqual(demarcheDossierEntrepriseModificationNewTitle)
        })
      })

      it('feDissolution should dissolve foundation', async () => {
        const rnfId = demarcheDossierEntrepriseDissolutionRnfId
        await insertDumbFoundation(prisma, {
          rnfId,
          title: 'This foundation will be dissolved',
          email: 'shouldNotChanged',
        })
        await request(app.getHttpServer())
          .get('/api/ds-configuration/trigger-refresh?type=feDissolution')
          .set('x-admin-token', 'e2e-test-admin-password')
          .expect(200)
        await prisma.foundation.findFirst({ where: { rnfId } }).then((f) => {
          expect(f?.dissolvedAt?.getTime()).toBeCloseTo(new Date().getTime(), -3)
        })
      })

      it('feAdministrationChanges should change foundation', async () => {
        const rnfId = demarcheDossierEntrepriseAdministrationChangesRnfId
        await insertDumbFoundation(prisma, {
          rnfId,
          title: 'some title',
          email: 'shouldNotChanged',
        })
        await request(app.getHttpServer())
          .get('/api/ds-configuration/trigger-refresh?type=triggerFeAdministrationChanges')
          .set('x-admin-token', 'e2e-test-admin-password')
          .expect(200)
        await prisma.foundation.findFirst({
          where: { rnfId },
          include: { persons: true },
        }).then((f) => {
          expect(f?.persons).toHaveLength(2)
        })
      })
    })
  })
})
