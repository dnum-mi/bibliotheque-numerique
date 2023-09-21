import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { FileService } from '@/modules/files/providers/file.service'
import { getUserCookie } from '../common/get-user-cookie'
import stream, { Readable } from 'stream'

describe('file-storage (e2e)', () => {
  let app: INestApplication
  let fileService: FileService
  let cookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    fileService = testingModule.fileService as FileService
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /files/:id - Should return 404 if file not found', async () => {
    cookie = await getUserCookie(app)
    return request(app.getHttpServer())
      .get('/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea')
      .set('Cookie', [cookie])
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'File doesn\'t exist',
        data: {},
        path: '/files/cf9fb439-2ff0-4fe1-8416-41b63834c5ea',
      })
  })

  it('GET /files/:id - Should return 400 if id is not valid', async () => {
    cookie = await getUserCookie(app)
    return request(app.getHttpServer())
      .get('/files/toto')
      .set('Cookie', [cookie])
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request Exception',
        data: {},
        path: '/files/toto',
      })
  })

  it('GET /files/:id - Should download file', async () => {
    const textInFile = 'test PJ.'
    const fileUuid = 'c8e8d568-64b8-4508-a2d4-d17586184b3f'
    jest.spyOn(fileService, 'findFileStorage').mockResolvedValue(
      {
        id: fileUuid,
        createAt: new Date(),
        updateAt: new Date(),
        name: '0855e52f3ad28137d4a69.jpg',
        path: 'http://127.0.0.1:9000/rnfbucket/0855e52f3ad28137d4a69.jpg',
        originalName: 'test.jpg',
        checksum: '0855e52f3ad28137d4a69',
        byteSize: 1000,
        mimeType: 'image/jpeg',
      },
    )
    jest.spyOn(fileService, 's3GetObject').mockImplementation((): stream.Readable => {
      const readable = new Readable()
      readable.push(textInFile)
      readable.push(null)
      return readable
    })
    cookie = await getUserCookie(app)
    await request(app.getHttpServer())
      .get(`/files/${fileUuid}`)
      .set('Cookie', [cookie])
      .expect(200)
      .expect(textInFile)
  })
})
