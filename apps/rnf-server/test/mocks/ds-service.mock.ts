import { dotationDossierDataMock } from './datas/dossier-dotation.data.mock'
import { entrepriseDossierDataMock } from './datas/dossier-entreprise.data.mock'
import { DsApiError } from '@dnum-mi/ds-api-client'
import { dnrDossierDataMock } from './datas/dossier-dnr.data.mock'
import {
  demarcheDossierEntrepriseModificationDataMock,
} from './datas/demarche-dossier-entreprise-modification.data.mock'
import { demarcheDossierEntrepriseDissolutionDataMock } from './datas/demarche-dossier-entreprise-dissolution.mock'

const dossierNotFoundGraphQlError = {
  data: null,
  errors: [
    {
      message: 'Dossier not found',
      locations: [
        {
          line: 191,
          column: 5,
        },
      ],
      path: ['dossier'],
      extensions: {
        code: 'not_found',
      },
    },
  ],
}

const badDossier = {
  champs: [null, null],
  demarche: { title: 'Fake title' },
  instructeurs: [
    {
      id: 'SW5zdHJ1Y3RldXItNA==',
      email: 'yoyo@gmail.com',
    },
  ],
}

const injectionSqlDossier = {
  ...dotationDossierDataMock,
  champs: dotationDossierDataMock.champs?.map((c) => {
    if (c.id === 'Q2hhbXAtOTI=') {
      return {
        ...c,
        stringValue: "test.test@test.fr' AND 1=1'",
      }
    }
    return c
  }),
}

export const dsServiceMock = {
  getOneDossier: jest.fn().mockImplementation((id: number) => {
    switch (id) {
    case 17:
      return dotationDossierDataMock
    case 65:
      return entrepriseDossierDataMock
    case 135:
      return dnrDossierDataMock
    case 500:
      return injectionSqlDossier
    case 37:
      return badDossier
    default:
      throw new DsApiError(dossierNotFoundGraphQlError)
    }
  }),
  getOneDemarcheWithDossier: jest.fn().mockImplementation((id: number) => {
    switch (id) {
    case 53:
      return demarcheDossierEntrepriseModificationDataMock
    case 54:
      return demarcheDossierEntrepriseDissolutionDataMock
    default:
      throw new DsApiError(dossierNotFoundGraphQlError)
    }
  }),
  writeRnfIdInPrivateAnnotation: jest.fn().mockResolvedValue(undefined),
}
