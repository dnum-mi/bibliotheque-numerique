import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { DossierSynchroniseOrganismeService } from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Mock } from 'vitest'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { HubService } from '@/modules/hub/providers/hub.service'

describe('DossierSynchroniseOrganismeService', () => {
  let service: DossierSynchroniseOrganismeService
  let hubService: HubService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DossierSynchroniseOrganismeService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === HubService) {
          return {
            getAssociation: jest.fn().mockResolvedValue({ id: 'Association number' }),
            getFoundation: jest.fn().mockResolvedValue({ id: 'Foundation number' }),
          }
        } else if (token === CustomBullService) {
          return {
            addSyncOneRnaOrganismeJob: jest
              .fn()
              .mockImplementation((name: string, payload: never) => ({
                name,
                payload,
              })),
            addSyncOneRnfOrganismeJob: jest
              .fn()
              .mockImplementation((name: string, payload: never) => ({
                name,
                payload,
              })),
          }
        } else if (token === FieldService){
          return {
            repository: {
              update: jest.fn().mockImplementation()
            }
          }
        }
      })
      .compile()

    service = module.get<DossierSynchroniseOrganismeService>(
      DossierSynchroniseOrganismeService,
    )

    hubService = module.get<Mock>(HubService)
  })

  describe('synchroniseOrganismeFromFields', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should not crash if no field', async () => {
      expect(
        await service.attachOrganismeRefsToFields([]),
      ).toBeUndefined()
    })

    it('should return undefined if no organisme field', async () => {
      expect(
        await service.attachOrganismeRefsToFields(
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
        ),
      ).toBeUndefined()
    })

    it('should synchronise an organisme from an RnaField', async () => {
      expect(
        await service.attachOrganismeRefsToFields(
          [
            {
              id: 1,
              dsChampType: 'RnaChamp',
              stringValue: 'some-random-rna',
            } as Field,
          ],
        ),
      ).toEqual(['some-random-rna'])
    })

    it('should synchronise an organisme from an RnfField', async () => {
      expect(
        await service.attachOrganismeRefsToFields(
          [
            {
              id: 1,
              dsChampType: 'RnfChamp',
              stringValue: 'some-random-rna',
            } as Field,
          ],
        ),
      ).toEqual(['some-random-rna'])
    })

    it('should synchronise an organisme from an TextField with rnf code', async () => {
      expect(
        await service.attachOrganismeRefsToFields(
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
        ),
      ).toEqual(['some-random-rna'])
    })

    it('should synchronise many organismes', async () => {
      expect(
        await service.attachOrganismeRefsToFields(
          [
            {
              id: 1,
              dsChampType: 'RnaChamp',
              stringValue: 'some-random-rna',
            } as Field,
            {
              id: 2,
              dsChampType: 'RnfChamp',
              stringValue: 'some-random-rna',
            } as Field,
            {
              id: 3,
              dsChampType: 'TextChamp',
              stringValue: 'some-random-rna',
              rawJson: {
                champDescriptor: {
                  description: 'blablabla#bn-rnf-field-bn# blabla./bla',
                },
              },
            } as Field,
          ],
        ),
      ).toEqual(['some-random-rna'])
      expect(hubService.getAssociation).toHaveBeenCalled()
      expect(hubService.getFoundation).toHaveBeenCalledTimes(2)
    })

  })

})
