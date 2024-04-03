import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DossierSynchroniseOrganismeService } from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DossierState } from '@dnum-mi/ds-api-client'
import { Mock } from 'vitest'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { eFieldCode } from '@/modules/dossiers/objects/constante/field-code.enum'

describe('DossierSynchroniseOrganismeService', () => {
  let service: DossierSynchroniseOrganismeService
  let updateFct: Mock

  beforeEach(async () => {
    updateFct = jest.fn().mockImplementation((where, update) =>({
        where,
        update,
      }),
    )
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DossierSynchroniseOrganismeService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === OrganismeService) {
          return {
            getOrCreateOrganismeIdFromRna: jest.fn().mockResolvedValue({ id: 42 }),
            getOrCreateOrganismeIdFromRnf: jest.fn().mockResolvedValue({ id: 42 }),
            repository: {
              update: updateFct,
            },
          }
        } else if (token === `BullQueue_${QueueName.sync}`) {
          return {
            add: jest
              .fn()
              .mockImplementation((name: string, payload: never) => ({
                name,
                payload,
              })),
          }
        }
      })
      .compile()

    service = module.get<DossierSynchroniseOrganismeService>(
      DossierSynchroniseOrganismeService,
    )
  })

  describe('synchroniseOrganismeFromFields', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should not crash if no field', async () => {
      expect(
        await service.synchroniseOrganismeFromFields([], 1),
      ).toBeUndefined()
    })

    it('should return undefined if no organisme field', async () => {
      expect(
        await service.synchroniseOrganismeFromFields(
          [
            {
              id: 1,
              dsChampType: 'SomeType',
              stringValue: 'some-random-rna',
              rawJson: {
                champDescriptor: {
                  description: 'some random description',
                },
              },
            } as Field,
          ],
          1,
        ),
      ).toBeUndefined()
    })

    it('should synchronise an organisme from an RnaField', async () => {
      expect(
        await service.synchroniseOrganismeFromFields(
          [
            {
              id: 1,
              dsChampType: 'RnaChamp',
              stringValue: 'some-random-rna',
            } as Field,
          ],
          1,
        ),
      ).toEqual({ id: 42 })
    })

    it('should synchronise an organisme from an RnfField', async () => {
      expect(
        await service.synchroniseOrganismeFromFields(
          [
            {
              id: 1,
              dsChampType: 'RnfChamp',
              stringValue: 'some-random-rna',
            } as Field,
          ],
          1,
        ),
      ).toEqual({ id: 42 })
    })

    it('should synchronise an organisme from an TextField with rnf code', async () => {
      expect(
        await service.synchroniseOrganismeFromFields(
          [
            {
              id: 1,
              dsChampType: 'TextChamp',
              stringValue: 'some-random-rna',
              rawJson: {
                champDescriptor: {
                  description: 'blablabla#bn-rnf-field-bn# blabla./bla',
                },
              },
            } as Field,
          ],
          1,
        ),
      ).toEqual({ id: 42 })
    })
  })

  describe('updateDeclarationYearFromDossier', () => {
    it('should do nothing if dossierState is not accepte or refused', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.EnConstruction,
        {} as Organisme,
        [],
      )
      expect(updateFct).not.toHaveBeenCalled()
    })

    it('should do nothing no declarationYear', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Accepte,
        {} as Organisme,
        [],
      )
      expect(updateFct).not.toHaveBeenCalled()
    })

    it('should do nothing if declarationYear is empty', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Accepte,
        {
          declarationYears: [1],
        } as Organisme,
        [
          {
            code: eFieldCode['account-year'],
            numberValue: null,
          } as Field,
        ],
      )
      expect(updateFct).not.toHaveBeenCalled()
    })

    it('should add declarationYear', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Accepte,
        {
          id: 42,
          declarationYears: [1],
          missingDeclarationYears: []
        } as Organisme,
        [
          {
            code: eFieldCode['account-year'],
            numberValue: 2,
          } as Field,
        ],
      )
      expect(updateFct).toHaveBeenCalled()
      expect(updateFct).toHaveLastReturnedWith({
        where: {id: 42},
        update: {
          declarationYears: [1,2],
          missingDeclarationYears: []
        }
      })
    })

    it('should add missingDeclarationYear', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Refuse,
        {
          id: 42,
          missingDeclarationYears: [1],
          declarationYears: [],
        } as Organisme,
        [
          {
            code: eFieldCode['account-year'],
            numberValue: 2,
          } as Field,
        ],
      )
      expect(updateFct).toHaveBeenCalled()
      expect(updateFct).toHaveLastReturnedWith({
        where: {id: 42},
        update: {
          missingDeclarationYears: [1, 2],
          declarationYears: [],
        }
      })
    })

    it('should not add already existing year', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Refuse,
        {
          id: 42,
          missingDeclarationYears: [1],
          declarationYears: [],
        } as Organisme,
        [
          {
            code: eFieldCode['account-year'],
            numberValue: 1,
          } as Field,
        ],
      )
      expect(updateFct).toHaveBeenCalled()
      expect(updateFct).toHaveLastReturnedWith({
        where: {id: 42},
        update: {
          missingDeclarationYears: [1],
          declarationYears: [],
        }
      })
    })

    it('should pass missingYear to declarationYear', async () => {
      await service.updateDeclarationYearFromDossier(
        DossierState.Accepte,
        {
          id: 42,
          missingDeclarationYears: [1],
          declarationYears: [],
        } as Organisme,
        [
          {
            code: eFieldCode['account-year'],
            numberValue: 1,
          } as Field,
        ],
      )
      expect(updateFct).toHaveBeenCalled()
      expect(updateFct).toHaveLastReturnedWith({
        where: {id: 42},
        update: {
          missingDeclarationYears: [],
          declarationYears: [1],
        }
      })
    })
  })
})
