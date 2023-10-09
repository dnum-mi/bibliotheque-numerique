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
            label: 'Moment',
            value: 'Après le: 2023-06-03',
          },
          {
            label: 'Montant',
            value: 'Plus grand que: 0',
          },
          {
            label: 'Organismefinanceur',
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
          label: 'Total des champs',
          total: 9,
        },
      ],
    })
  })

  it('Should return nb champs and montant', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/custom-filters/demarche/1/5/stats')
      .set('Cookie', [cookie])
      .expect(200)

    expect(body).toMatchObject({
      customFilter: {
        filters: [
          {
            label: 'Pays',
            value: 'Contient le mot: a',
          },
        ],
        id: 5,
        name: 'Total montant for champs',
      },
      demarche: {
        dsId: 76,
        id: 1,
        title: 'Déclaration de financement étranger',
      },
      totals: [
        {
          label: 'Total des champs',
          total: 10,
        },
        {
          label: 'Montant',
          total: 125800,
        },
      ],
    })
  })

  it('Should return nb dossiers and montant', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/custom-filters/demarche/1/6/stats')
      .set('Cookie', [cookie])
      .expect(200)

    expect(body).toMatchObject({
      customFilter: {
        filters: [
          {
            label: 'Pays',
            value: 'Contient le mot: a',
          },
        ],
        id: 6,
        name: 'Total montant for dossier',
      },
      demarche: {
        dsId: 76,
        id: 1,
        title: 'Déclaration de financement étranger',
      },
      totals: [
        {
          label: 'Total des dossiers',
          total: 5,
        },
        {
          label: 'Montant',
          total: 175800,
        },
      ],
    })
  })
})
