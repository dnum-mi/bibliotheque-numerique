import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { testingModuleFactory } from '../testing-module.factory'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'

describe('Ds Controller (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    ({ app, prisma } = await testingModuleFactory())
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('GET /ds/url - Should return DS url', async () => {
    return await request(app.getHttpServer()).get('/api/ds/url').expect(200).expect({
      url: 'no-url-for-e2e-test',
    })
  })
})
