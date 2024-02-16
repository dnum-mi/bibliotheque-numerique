import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { FieldService, TDossierWithPrefecture } from './field.service'
import { fixFields } from '../objects/constante/fix-field.dictionnary'
import { Field } from '../objects/entities/field.entity'

import * as dayjs from 'dayjs'
import { FieldSource, FieldType, FormatFunctionRef } from '@biblio-num/shared-utils'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

const fakeMappingColumnHash: MappingColumn[] = [
  ...fixFields,
  {
    type: FieldType.number,
    id: 'Q4hhbXAtMTA0Mw==',
    formatFunctionRef: null,
    source: FieldSource.champs,
    columnLabel: null,
    originalLabel: 'Total de doritos dans le monde',
  },
  {
    type: FieldType.date,
    id: 'Q1hhbXAtMTA0Mw==',
    formatFunctionRef: null,
    source: FieldSource.annotation,
    columnLabel: null,
    originalLabel: "Naissance de quelqu'un",
  },
  {
    type: FieldType.string,
    id: 'Q2hhbXAtMTA2NQ==',
    formatFunctionRef: null,
    source: FieldSource.champs,
    columnLabel: null,
    originalLabel: 'Champ répétable',
    children: [
      {
        type: FieldType.string,
        id: 'A2hhbXAtMTA2NQ==',
        formatFunctionRef: FormatFunctionRef.country,
        source: FieldSource.champs,
        columnLabel: null,
        originalLabel: "Pays d'origine du financement",
      },
      {
        type: FieldType.number,
        id: 'B2hhbXAtMTA2NQ==',
        formatFunctionRef: null,
        source: FieldSource.champs,
        columnLabel: null,
        originalLabel: 'Montant du financement',
      },
    ],
  },
]

const expectedFixFieldsDates = (
  dossierId,
  dateDepot = null,
  datePassageEnInstruction = null,
  datePassageEnConstruction = null): Partial<Field>[] => ([
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c11',
    label: 'Date de dépot',
    formatFunctionRef: undefined,
    type: FieldType.date,
    fieldSource: FieldSource.fixField,
    stringValue: dateDepot ? dayjs(dateDepot).toISOString() : '',
    dateValue: dateDepot ? dayjs(dateDepot).toDate() : null,
    numberValue: null,
    dossierId,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c12',
    label: 'Date de passage en instruction',
    formatFunctionRef: undefined,
    type: FieldType.date,
    fieldSource: FieldSource.fixField,
    stringValue: dateDepot ? dayjs(datePassageEnInstruction).toISOString() : '',
    dateValue: dateDepot ? dayjs(datePassageEnInstruction).toDate() : null,
    numberValue: null,
    dossierId,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c13',
    label: 'Date de passage en construction',
    formatFunctionRef: undefined,
    type: FieldType.date,
    fieldSource: FieldSource.fixField,
    stringValue: dateDepot ? dayjs(datePassageEnConstruction).toISOString() : '',
    dateValue: dateDepot ? dayjs(datePassageEnConstruction).toDate() : null,
    numberValue: null,
    dossierId,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
])

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const expectClassicalFixFields = (status?: string) => [
  {
    sourceId: '96151176-4624-4706-b861-722d2e53545d',
    label: 'Id démarche simplifié',
    formatFunctionRef: undefined,
    type: FieldType.number,
    fieldSource: FieldSource.fixField,
    stringValue: '142',
    dateValue: null,
    numberValue: 142,
    dossierId: 42,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4',
    label: 'Status',
    formatFunctionRef: 'status',
    type: 'enum',
    fieldSource: 'fix-field',
    stringValue: status || 'bientôt cuit',
    dateValue: null,
    numberValue: null,
    dossierId: 42,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
  {
    sourceId: '9863ce70-6378-4d7e-aca9-b81fb7b97c10',
    label: 'préfecture',
    type: 'string',
    fieldSource: 'fix-field',
    formatFunctionRef: FormatFunctionRef.prefecture,
    stringValue: '',
    dateValue: null,
    numberValue: null,
    dossierId: 42,
    parentRowIndex: null,
    rawJson: null,
    dsChampType: null,
  },
]

describe('FieldService', () => {
  let service: FieldService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [FieldService],
    })
      .useMocker((token) => {
        if (token === 'FieldRepository') {
          return {
            delete: jest.fn().mockResolvedValue(true),
            save: jest.fn().mockImplementation((a) => a),
          }
        } else if (token === LoggerService) {
          return loggerServiceMock
        }
      })
      .compile()

    service = module.get<FieldService>(FieldService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('Should create at least fixFields', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'bientôt cuit',
      number: 142,
      dateDepot: dayjs('2022-10-13T10:04:29').toISOString(),
      datePassageEnInstruction: dayjs('2022-10-13T10:04:29').toISOString(),
      datePassageEnConstruction: dayjs('2022-10-13T10:04:29').toISOString(),
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as TDossierWithPrefecture, 42, fakeMappingColumnHash)
    expect(fields).toEqual([
      ...expectClassicalFixFields(),
      ...expectedFixFieldsDates(42, raw.dateDepot, raw.datePassageEnInstruction, raw.datePassageEnConstruction),
    ])
  })

  it('Should create fixfield and one number champs', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'bientôt cuit',
      number: 142,
      champs: [
        {
          id: 'Q4hhbXAtMTA0Mw==',
          __typename: 'DecimalNumberChamp',
          label: 'Total de doritos dans le monde',
          stringValue: '4569873456.123',
          champDescriptor: {
            id: 'Q4hhbXAtMTA0Mw==',
          },
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as unknown as TDossierWithPrefecture, 42, fakeMappingColumnHash)
    expect(fields).toMatchObject([
      ...expectClassicalFixFields(),
      ...expectedFixFieldsDates(42),
      {
        sourceId: 'Q4hhbXAtMTA0Mw==',
        label: 'Total de doritos dans le monde',
        formatFunctionRef: null,
        type: 'number',
        fieldSource: 'champs',
        stringValue: '4569873456.123',
        dateValue: null,
        numberValue: 4569873456.123,
        dsChampType: 'DecimalNumberChamp',
        dossierId: 42,
        parentRowIndex: null,
        children: null,
      },
    ])
  })

  it('Should not crash if number champ is wrong', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'bientôt cuit',
      number: 142,
      champs: [
        {
          id: 'Q4hhbXAtMTA0Mw==',
          __typename: 'DecimalNumberChamp',
          label: 'Total de doritos dans le monde',
          stringValue: 'JE SUIS PAS UN NOMBRE HIHIHII HAHAHAHA',
          champDescriptor: {
            id: 'Q4hhbXAtMTA0Mw==',
          },
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as unknown as TDossierWithPrefecture, 42, fakeMappingColumnHash)
    expect(fields).toMatchObject([
      ...expectClassicalFixFields(),
      ...expectedFixFieldsDates(42),
      {
        sourceId: 'Q4hhbXAtMTA0Mw==',
        label: 'Total de doritos dans le monde',
        formatFunctionRef: null,
        type: 'number',
        fieldSource: 'champs',
        stringValue: 'JE SUIS PAS UN NOMBRE HIHIHII HAHAHAHA',
        dateValue: null,
        numberValue: null,
        dsChampType: 'DecimalNumberChamp',
        dossierId: 42,
        parentRowIndex: null,
        children: null,
      },
    ])
  })

  it('Should create fixfield and one date annotation', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'bientôt cuit',
      number: 142,
      annotations: [
        {
          id: 'Q1hhbXAtMTA0Mw==',
          __typename: 'DateChamp',
          label: "Naissance de quelqu'un",
          stringValue: '2023-08-18',
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as TDossierWithPrefecture, 42, fakeMappingColumnHash)
    expect(fields).toMatchObject([
      ...expectClassicalFixFields(),
      ...expectedFixFieldsDates(42),
      {
        sourceId: 'Q1hhbXAtMTA0Mw==',
        label: "Naissance de quelqu'un",
        formatFunctionRef: null,
        type: 'date',
        fieldSource: 'annotation',
        stringValue: '2023-08-18',
        numberValue: null,
        dsChampType: 'DateChamp',
        dossierId: 42,
        parentRowIndex: null,
        children: null,
      },
    ])
    expect(new Date('2023-08-18').getTime()).toEqual(fields[fields.length - 1].dateValue.getTime())
  })

  it('Create children scenario for repetable champs', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'à point',
      number: 142,
      champs: [
        {
          id: 'useless',
          __typename: 'RepetitionChamp',
          label: "Déclaration d'un financement d'un montant supérieur à 15 300 €",
          stringValue: '',
          champDescriptor: {
            id: 'Q2hhbXAtMTA2NQ==',
          },
          rows: [
            {
              champs: [
                {
                  id: 'useless',
                  __typename: 'PaysChamp',
                  label: "Pays d'origine du financement",
                  stringValue: 'Anguilla',
                  champDescriptor: {
                    id: 'A2hhbXAtMTA2NQ==',
                  },
                  pays: {
                    name: 'Anguilla',
                    code: 'AI',
                  },
                },
                {
                  id: 'useless',
                  __typename: 'IntegerNumberChamp',
                  label: 'Montant du financement',
                  stringValue: '1111111',
                  integerNumber: '1111111',
                  champDescriptor: {
                    id: 'B2hhbXAtMTA2NQ==',
                  },
                },
              ],
            },
            {
              champs: [
                {
                  id: 'useless',
                  __typename: 'PaysChamp',
                  label: "Pays d'origine du financement",
                  stringValue: 'Algeria',
                  pays: {
                    name: 'Algeria',
                    code: 'DZ',
                  },
                  champDescriptor: {
                    id: 'A2hhbXAtMTA2NQ==',
                  },
                },
                {
                  id: 'useless',
                  __typename: 'IntegerNumberChamp',
                  label: 'Montant du financement',
                  stringValue: '10',
                  integerNumber: '10',
                  champDescriptor: {
                    id: 'B2hhbXAtMTA2NQ==',
                  },
                },
              ],
            },
          ],
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as unknown as TDossierWithPrefecture, 42, fakeMappingColumnHash)
    expect(fields).toMatchObject([
      ...expectClassicalFixFields(raw.state),
      ...expectedFixFieldsDates(42),
      {
        sourceId: 'Q2hhbXAtMTA2NQ==',
        label: 'Champ répétable',
        formatFunctionRef: null,
        type: 'string',
        fieldSource: 'champs',
        stringValue: '',
        dateValue: null,
        numberValue: null,
        dsChampType: 'RepetitionChamp',
        dossierId: 42,
        parentRowIndex: null,
        children: [
          {
            sourceId: 'A2hhbXAtMTA2NQ==',
            label: "Pays d'origine du financement",
            formatFunctionRef: FormatFunctionRef.country,
            type: 'string',
            fieldSource: 'champs',
            stringValue: 'Anguilla',
            dateValue: null,
            numberValue: null,
            dsChampType: 'PaysChamp',
            dossierId: 42,
            parentRowIndex: 0,
            children: null,
          },
          {
            sourceId: 'B2hhbXAtMTA2NQ==',
            label: 'Montant du financement',
            formatFunctionRef: null,
            type: 'number',
            fieldSource: 'champs',
            stringValue: '1111111',
            dateValue: null,
            numberValue: 1111111,
            dsChampType: 'IntegerNumberChamp',
            dossierId: 42,
            parentRowIndex: 0,
            children: null,
          },
          {
            sourceId: 'A2hhbXAtMTA2NQ==',
            label: "Pays d'origine du financement",
            formatFunctionRef: FormatFunctionRef.country,
            type: 'string',
            fieldSource: 'champs',
            stringValue: 'Algeria',
            dateValue: null,
            numberValue: null,
            dsChampType: 'PaysChamp',
            dossierId: 42,
            parentRowIndex: 1,
            children: null,
          },
          {
            sourceId: 'B2hhbXAtMTA2NQ==',
            label: 'Montant du financement',
            formatFunctionRef: null,
            type: 'number',
            fieldSource: 'champs',
            stringValue: '10',
            dateValue: null,
            numberValue: 10,
            dsChampType: 'IntegerNumberChamp',
            dossierId: 42,
            parentRowIndex: 1,
            children: null,
          },
        ],
      },
    ])
  })
})
