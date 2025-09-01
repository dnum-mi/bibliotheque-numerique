import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { TestingModuleFactory } from '../common/testing-module.factory'
import { dataSource } from '../data-source-e2e.typeorm'

describe('statistique', () => {
  let app: INestApplication
  let token: string

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    token = testingModule.tokens.instructor
  })

  afterAll(async () => {
    await app.close()
    await dataSource.destroy()
  })

  it('Should return nb dossiers', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/custom-filters/4/stats')
      .set('Authorization', `Bearer ${token}`)
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
        title: 'Déclaration de FE',
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
      .get('/custom-filters/5/stats')
      .set('Authorization', `Bearer ${token}`)
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
        title: 'Déclaration de FE',
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
      .get('/custom-filters/6/stats')
      .set('Authorization', `Bearer ${token}`)
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
        title: 'Déclaration de FE',
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
