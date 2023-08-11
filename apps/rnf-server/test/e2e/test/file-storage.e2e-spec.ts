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
    return await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/test.txt')
      .expect(201)
      .expect({
        id: expect.any(String),
        name: 'test.txt',
        path: expect.any(String),
        mimeType: 'text/plain',
        byteSize: 12,
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
  })

  it('POST /files/upload - Should upload file with custom name', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/test.txt')
      .field('name', 'custom-name.txt')
      .expect(201)
      .expect({
        id: expect.any(String),
        name: 'custom-name.txt',
        path: expect.any(String),
        mimeType: 'text/plain',
        byteSize: 12,
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
  })

  it('POST /files/upload - Should return 400 if file is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/upload')
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['file should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/upload - Should return 400 if file name is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/test.txt')
      .field('name', '')
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['name should not be empty'],
        error: 'Bad Request',
      })
  })

  it('GET /files/:id - Should download file', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/api/files/upload')
      .attach('file', './test/mocks/datas/pj/test.txt')
      .expect(201)
    return await request(app.getHttpServer())
      .get(`/api/files/${body.id}`)
      .expect(200)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '12')
      .expect('Content-Disposition', 'attachment; filename="test.txt"')
      .expect('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('GET /files/:id - Should return 404 if file not found', async () => {
    return await request(app.getHttpServer())
      .get('/api/files/123')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'File not found',
      })
  })

  it('GET /files/:id - Should return 400 if id is not valid', async () => {
    return await request(app.getHttpServer())
      .get('/api/files/toto')
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (uuid  is expected)',
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should copy file', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(201)
      .expect({
        id: expect.any(String),
        name: 'LICENSE',
        path: expect.any(String),
        mimeType: 'text/plain',
        byteSize: 1078,
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
  })

  it('POST /files/copy - Should return 400 if fileUrl is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['fileUrl should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if fileName is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['fileName should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if checksum is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['checksum should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if mimeType is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['mimeType should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if byteSize is not provided', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['byteSize should not be empty'],
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if fileUrl is not valid', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'toto',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (url must be an URL address)',
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if checksum is not valid', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'toto',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (sha256 must be a sha256 checksum)',
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if mimeType is not valid', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'toto',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (mimeType must be a mimeType)',
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if byteSize is not valid', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: 'toto',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Validation failed (byteSize must be a number conforming to the specified constraints)',
        error: 'Bad Request',
      })
  })

  it('POST /files/copy - Should return 400 if fileUrl is not reachable', async () => {
    return await request(app.getHttpServer())
      .post('/api/files/copy')
      .send({
        fileUrl: 'https://raw.githubusercontent.com/Redocly/redoc/master/LICENSE2',
        fileName: 'LICENSE',
        checksum: 'd41d8cd98f00b204e9800998ecf8427e',
        mimeType: 'text/plain',
        byteSize: '1078',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'File not reachable',
        error: 'Bad Request',
      })
  })
})
