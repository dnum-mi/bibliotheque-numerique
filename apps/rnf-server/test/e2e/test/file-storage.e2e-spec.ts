import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { testingModuleFactory } from '../testing-module.factory'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { FileStorageService } from '@/modules/file-storage/providers/file-storage.service'
import stream, { Readable } from 'stream'

describe('file-storage (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let fileStorage: FileStorageService

  beforeAll(async () => {
    ({
      app,
      prisma,
      fileStorage,
    } = await testingModuleFactory())
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('GET /files/:id - Should return 404 if file not found', () => {
    return request(app.getHttpServer())
      .get('/api/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'UUID not found',
        data: {},
        path: '/api/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea',
      })
  })

  it('GET /files/:id - Should return 400 if id is not valid', () => {
    return request(app.getHttpServer())
      .get('/api/files/toto')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation error(s):\n Champ uuid: uuid must be a UUID',
        data: {},
        path: '/api/files/toto',
      })
  })

  it('GET /files/:id - Should download file', async () => {
    const textInFile = 'test PJ.'
    const fileUuid = 'c8e8d568-64b8-4508-a2d4-d17586184b3f'
    jest.spyOn(fileStorage, 'findFileStorage').mockResolvedValue(
      {
        id: 1,
        uuid: fileUuid,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: '0855e52f3ad28137d4a69.jpg',
        path: 'http://127.0.0.1:9000/rnfbucket/0855e52f3ad28137d4a69.jpg',
        originalName: 'test.jpg',
        checksum: '0855e52f3ad28137d4a69',
        byteSize: 1000,
        mimeType: 'image/jpeg',
        foundationId: 1,
      },
    )
    jest.spyOn(fileStorage, 's3GetObject').mockImplementation((): stream.Readable => {
      const readable = new Readable()
      readable.push(textInFile)
      readable.push(null)
      return readable
    })
    await request(app.getHttpServer())
      .get(`/api/files/${fileUuid}`)
      .expect(200)
      .expect(textInFile)
  })
})
