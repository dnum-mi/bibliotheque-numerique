import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { testingModuleFactory } from '../testing-module.factory'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'

describe('file-storage (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    ({ app, prisma } = await testingModuleFactory())
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('POST /files/upload - Should upload file', async () => {
    const result = await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/goodFile.txt')
      .expect(201)
    expect(result.body).toMatchObject({
      id: expect.any(Number),
      uuid: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      name: expect.any(String),
      path: expect.any(String),
      originalName: 'goodFile.txt',
      checksum: '',
      byteSize: 9,
      mimeType: 'text/plain',
    })
  })

  it('POST /files/upload - Should return 400 if file is not provided', () => {
    return request(app.getHttpServer())
      .post('/api/files/upload')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'file should not be empty',
        data: {},
        path: '/api/files/upload',
      })
  })

  it('POST /files/upload - Should return 422 if file extension is not valid', () => {
    return request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/badFile.sh')
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'File is not valid',
        data: {},
        path: '/api/files/upload',
      })
  })

  it('GET /files/:id - Should download file', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/goodFile.txt')
      .expect(201)
    return request(app.getHttpServer())
      .get(`/api/files/${body.uuid}`)
      .expect(200)
      .expect('test PJ.\n')
  })

  it('GET /files/:id - Should return 404 if file not found', () => {
    return request(app.getHttpServer())
      .get('/api/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Not Found',
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
        message: 'Validation failed (uuid  is expected)',
        data: {},
        path: '/api/files/toto',
      })
  })

  it('POST /files/copy - Should copy file', async () => {
    const result = await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://developer.mozilla.org/favicon-48x48.cbbd161b.png',
        fileName: 'favicon-48x48.cbbd161b.png',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'image/png',
        byteSize: '1078',
      })
      .expect(201)
    expect(result.body).toMatchObject({
      id: expect.any(Number),
      uuid: expect.any(String),
      name: expect.any(String),
      path: expect.any(String),
      originalName: 'favicon-48x48.cbbd161b.png',
      mimeType: 'image/png',
      byteSize: 1078,
      checksum: 'd41d8cd98f00b204e9800998ecf8427e',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('POST /files/copy - Should return 404 if fileUrl is not reachable', () => {
    return request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://developer.mozilla.org/badFile.png',
        fileName: 'badFile.png',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'image/png',
        byteSize: '1078',
      })
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'File is not found',
        data: {},
        path: '/api/files/copy',

      })
  })
})
