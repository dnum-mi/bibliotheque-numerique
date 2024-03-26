import { Cookies, TestingModuleFactory } from '../../../common/testing-module.factory'
import { dataSource } from '../../../data-source-e2e.typeorm'
import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'
import * as request from 'supertest'

describe('Demarche sync processors', () => {
  let app: INestApplication
  let syncQueue: Queue
  let cookies: Cookies

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    syncQueue = testingModule.syncQueue
    cookies = testingModule.cookies
    syncQueue.empty()
    syncQueue.pause()
  })

  afterAll(async () => {
    // TODO: Impact on redis dev which is on pause
    await syncQueue.resume()
    await app.close()
    await dataSource.destroy()
  })

  it('Only sudo can call synchronisation', () => {
    return request(app.getHttpServer())
      .put(`/demarches/${1}/sync`)
      .set('Cookie', [cookies.superadmin])
      .expect(403)
  })

  it.only('Calling sync one demarche should add a job into queue', async () => {
    expect(await syncQueue.count()).toEqual(0)
    await request(app.getHttpServer())
      .put('/demarches/1/sync')
      .set('Cookie', [cookies.sudo])
      .expect(200)

    console.log(await syncQueue.getJobCounts())
    expect(await syncQueue.count()).toEqual(1)
  })
})
