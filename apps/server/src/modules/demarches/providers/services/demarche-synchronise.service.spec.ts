import { Queue } from "bull"
import { Repository } from "typeorm"
import { fakerFR as faker } from '@faker-js/faker'

import {
  DsApiClient,
  Revision,
  type Demarche as TDemarche,
} from '@dnum-mi/ds-api-client'
import { loggerServiceMock } from "../../../../../test/mock/logger-service.mock"
import { Demarche } from "../../objects/entities/demarche.entity"
import { DemarcheSynchroniseService } from "./demarche-synchronise.service"
import { DemarcheService } from "./demarche.service"
import { eIdentificationDemarche, IdentificationDemarcheKey, OrganismeTypeKey } from "@biblio-num/shared"
import { MappingColumn } from "../../objects/dtos/mapping-column.dto"
import { fixFieldsExcelChamps } from "../../../dossiers/objects/constante/fix-field-excel-champ.dictionnary"

const demarcheServiceMock = jest.createMockFromModule<DemarcheService>('./demarche.service')
const repoDemarcheMock = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
} as any
const dsApiClientMock = jest.createMockFromModule<DsApiClient>('@dnum-mi/ds-api-client')
const syncQueueMock = jest.createMockFromModule<Queue>('bull')

describe('Demarche sync service', () => {
  let service: DemarcheSynchroniseService
  beforeEach(async () => {
    service = new DemarcheSynchroniseService(
      loggerServiceMock,
      demarcheServiceMock,
      repoDemarcheMock as Repository<Demarche>,
      dsApiClientMock,
      syncQueueMock,
    )
  })

  it('should generate MappingColumn with FE fix-field and with the labels', () => {

    const idRepetition = faker.string.nanoid(10)
    const idSousChamp1 = faker.string.nanoid(10)
    const idSousChamp2 = faker.string.nanoid(10)
    const idSousChamp3 = faker.string.nanoid(10)
    const labelRepetition = faker.lorem.words(3)
    const labelSousChamp1 = faker.lorem.words(3)
    const labelSousChamp2 = faker.lorem.words(3)
    const labelSousChamp3 = faker.lorem.words(3)
    const descriptionSousChamp2 = faker.lorem.words(3)
    const descriptionSousChamp3 = faker.lorem.words(3)
    const demarche:Partial<TDemarche>= {
      id: '123',
      title: 'Ma super démarche',
      publishedRevision: {
        id: "123",
        champDescriptors: [
          {
            "id": idRepetition,
            "type": "repetition",
            "label": labelRepetition,
            "required": false,
            "__typename": "RepetitionChampDescriptor",
            "description": "",
            "champDescriptors": [
                {
                    "id": idSousChamp1,
                    "type": "pays",
                    "label": labelSousChamp1,
                    "required": false,
                    // @ts-ignore
                    "__typename": "PaysChampDescriptor",
                    "description": ""
                },
                {
                    "id": idSousChamp2,
                    "type": "integer_number",
                    "label": labelSousChamp2,
                    "required": false,
                    // @ts-ignore
                    "__typename": "IntegerNumberChampDescriptor",
                    "description":descriptionSousChamp2,
                },
                {
                    "id": idSousChamp3,
                    "type": "piece_justificative",
                    "label": labelSousChamp3,
                    "required": false,
                    // @ts-ignore
                    "__typename": "PieceJustificativeChampDescriptor",
                    "description": descriptionSousChamp3,
                }
            ]
          }
        ],
      },
    }
    const fixFiledsOriginalMappingColumns: MappingColumn = {
      ...fixFieldsExcelChamps,
      children: fixFieldsExcelChamps.children.map(c => ({...c, columnLabel: c.originalLabel}) ),
    }
    const repeatableOriginalMappingColumn: MappingColumn = {
      "id": idRepetition,
      "type": "string",
      "source": "champs",
      "children": [
          {
              "id": idSousChamp1,
              "type": "string",
              "source": "champs",
              "isHeader": false,
              "columnLabel": faker.lorem.words(3),
              "originalLabel": labelSousChamp1,
              "formatFunctionRef": "country",
              "originalDescription": ""
          },
          {
              "id": idSousChamp2,
              "type": "number",
              "source": "champs",
              "isHeader": false,
              "columnLabel": faker.lorem.words(3),
              "originalLabel": labelSousChamp2,
              "formatFunctionRef": null,
              "originalDescription": descriptionSousChamp2,
          },
          {
              "id": idSousChamp3,
              "type": "file",
              "source": "champs",
              "isHeader": false,
              "columnLabel": faker.lorem.words(3),
              "originalLabel": labelSousChamp3,
              "formatFunctionRef": "file",
              "originalDescription": descriptionSousChamp3,
          }
      ],
      "isHeader": false,
      "columnLabel": null,
      "originalLabel": labelRepetition,
      "formatFunctionRef": null,
      "originalDescription": ""
    }
    const originalMappingColumns: MappingColumn[] = [
      {
        ...fixFiledsOriginalMappingColumns,
      },
      {
        ...repeatableOriginalMappingColumn,
      },
    ]

    const identification: IdentificationDemarcheKey = eIdentificationDemarche.FE
    const result = service['_generateMappingColumns'](demarche, originalMappingColumns, identification )

    expect(result).toMatchObject(expect.arrayContaining([fixFiledsOriginalMappingColumns]))
    expect(result.find(r => r.id === repeatableOriginalMappingColumn.id)).toMatchObject(repeatableOriginalMappingColumn)
   })
})
