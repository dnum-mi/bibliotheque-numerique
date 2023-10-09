import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'
import { getUserCookie } from '../common/get-user-cookie'

describe('statistique', () => {
  let app: INestApplication
  let cookie: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    // filterService = await app.resolve<CustomFilterService>(CustomFilterService)
    // await filterService.remove({ name: 'Superman' })
    cookie = await getUserCookie(app, 'test.demarche.2@localhost.com')
    // demarchesCount = await dataSource.manager.count(Demarche)
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it('Should return nb dossiers', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/custom-filters/demarche/1/4/stats')
      .set('Cookie', [cookie])
      .expect(200)

    expect(body).toMatchObject({
      customFilter: {
        filters: [
          {
            label: 'I02',
            value: 'Après le: 2023-06-03',
          },
          {
            label: 'I08',
            value: 'Plus grand que: 0',
          },
          {
            label: 'I10',
            value: 'Contient le mot: babo',
          },
        ],
        id: 4,
        name: 'My custom filter for stats',
      },
      demarche: {
        dsId: 76,
        id: 1,
        title: 'Déclaration de financement étranger',
      },
      totals: [
        {
          label: 'Total des dossiers',
          total: '2',
        },
      ],
    })
  })
})
