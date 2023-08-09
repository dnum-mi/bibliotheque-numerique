import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { FieldService } from './field.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/types'

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

  it('Create simple first level champs fields', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      champs: [
        {
          id: 'Q2hhbXAtMTA0Mw==',
          __typename: 'TextChamp',
          label: 'Informations relatives au bénéficiaire du financement',
          stringValue: 'toto',
          champDescriptor: {
            id: 'Q4hhbXAtMTA0Mw==',
          },
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as Partial<TDossier>, 42)
    expect(fields).toEqual([
      {
        dsFieldId: 'Q4hhbXAtMTA0Mw==',
        label: 'Informations relatives au bénéficiaire du financement',
        stringValue: 'toto',
        dsChampType: 'TextChamp',
        fieldSource: 'champs',
        formatFunctionRef: null,
        type: 'string',
        parentRowIndex: null,
        children: null,
        dossierId: 42,
        rawJson: {
          id: 'Q2hhbXAtMTA0Mw==',
          __typename: 'TextChamp',
          label: 'Informations relatives au bénéficiaire du financement',
          stringValue: 'toto',
          champDescriptor: {
            id: 'Q4hhbXAtMTA0Mw==',
          },
        },
      },
    ])
  })

  it('Create simple first level dossier fields', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
      state: 'en cours',
      champs: [],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as Partial<TDossier>, 42)
    expect(fields).toEqual([
      {
        dsFieldId: null,
        label: 'state',
        stringValue: 'en cours',
        dsChampType: null,
        fieldSource: 'dossier',
        formatFunctionRef: null,
        type: 'string',
        parentRowIndex: null,
        children: null,
        dossierId: 42,
        rawJson: null,
      },
    ])
  })

  it('Create children field for repetable champs', async () => {
    const raw = {
      id: 'RG9zc2llci0xMzY=',
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
                    id: 'Q2hhbXAtMTA2Nnww',
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
                    id: 'Q2hhbXAtMTA3MXww',
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
                    id: 'pBUkM1UlZZMzMwSg==',
                  },
                },
                {
                  id: 'useless',
                  __typename: 'IntegerNumberChamp',
                  label: 'Montant du financement',
                  stringValue: '10',
                  integerNumber: '10',
                  champDescriptor: {
                    id: 'MUg1MkRSNlpKUkhRUl',
                  },
                },
              ],
            },
          ],
        },
      ],
    }
    const fields = await service.overwriteFieldsFromDataJson(raw as Partial<TDossier>, 42)
    expect(fields).toMatchObject([
      {
        dsFieldId: 'Q2hhbXAtMTA2NQ==',
        label: "Déclaration d'un financement d'un montant supérieur à 15 300 €",
        stringValue: '',
        dsChampType: 'RepetitionChamp',
        fieldSource: 'champs',
        formatFunctionRef: null,
        type: 'string',
        rawJson: {
          id: 'useless',
          __typename: 'RepetitionChamp',
          label: "Déclaration d'un financement d'un montant supérieur à 15 300 €",
          stringValue: '',
          champDescriptor: {
            id: 'Q2hhbXAtMTA2NQ==',
          },
        },
        children: [
          {
            dsFieldId: 'Q2hhbXAtMTA2Nnww',
            label: "Pays d'origine du financement",
            stringValue: 'Anguilla',
            dsChampType: 'PaysChamp',
            fieldSource: 'champs',
            formatFunctionRef: 'country',
            type: 'string',
            rawJson: {
              id: 'useless',
              __typename: 'PaysChamp',
              label: "Pays d'origine du financement",
              stringValue: 'Anguilla',
              pays: {
                code: 'AI',
                name: 'Anguilla',
              },
              champDescriptor: {
                id: 'Q2hhbXAtMTA2Nnww',
              },
            },
            parentRowIndex: 0,
            children: null,
            dossierId: 42,
          },
          {
            dsFieldId: 'Q2hhbXAtMTA3MXww',
            label: 'Montant du financement',
            stringValue: '1111111',
            dsChampType: 'IntegerNumberChamp',
            fieldSource: 'champs',
            formatFunctionRef: null,
            type: 'number',
            rawJson: {
              id: 'useless',
              __typename: 'IntegerNumberChamp',
              label: 'Montant du financement',
              stringValue: '1111111',
              integerNumber: '1111111',
              champDescriptor: {
                id: 'Q2hhbXAtMTA3MXww',
              },
            },
            parentRowIndex: 0,
            children: null,
            dossierId: 42,
          },
          {
            dsFieldId: 'pBUkM1UlZZMzMwSg==',
            label: "Pays d'origine du financement",
            stringValue: 'Algeria',
            dsChampType: 'PaysChamp',
            fieldSource: 'champs',
            formatFunctionRef: 'country',
            type: 'string',
            rawJson: {
              id: 'useless',
              __typename: 'PaysChamp',
              label: "Pays d'origine du financement",
              stringValue: 'Algeria',
              pays: {
                code: 'DZ',
                name: 'Algeria',
              },
              champDescriptor: {
                id: 'pBUkM1UlZZMzMwSg==',
              },
            },
            parentRowIndex: 1,
            children: null,
            dossierId: 42,
          },
          {
            dsFieldId: 'MUg1MkRSNlpKUkhRUl',
            label: 'Montant du financement',
            stringValue: '10',
            dsChampType: 'IntegerNumberChamp',
            fieldSource: 'champs',
            formatFunctionRef: null,
            type: 'number',
            rawJson: {
              id: 'useless',
              __typename: 'IntegerNumberChamp',
              label: 'Montant du financement',
              stringValue: '10',
              integerNumber: '10',
              champDescriptor: {
                id: 'MUg1MkRSNlpKUkhRUl',
              },
            },
            parentRowIndex: 1,
            children: null,
            dossierId: 42,
          },
        ],
        parentRowIndex: null,
        dossierId: 42,
      },
    ])
  })
})
