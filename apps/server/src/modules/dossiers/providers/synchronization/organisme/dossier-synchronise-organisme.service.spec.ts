import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { DossierSynchroniseOrganismeService } from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'

describe('DossierSynchroniseOrganismeService', () => {
  let service: DossierSynchroniseOrganismeService

  beforeEach(async () => {
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
            getOrCreateOrganismeIdFromRna: jest.fn().mockResolvedValue(42),
            getOrCreateOrganismeIdFromRnf: jest.fn().mockResolvedValue(42),
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

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should not crash if no field', async () => {
    expect(await service.synchroniseOrganismeFromFields([], 1)).toBeUndefined()
  })

  it('should return undefined if no organisme field', async () => {
    expect(await service.synchroniseOrganismeFromFields([{
      id: 1,
      dsChampType: 'SomeType',
      stringValue: 'some-random-rna',
      rawJson: {
        champDescriptor: {
          description: 'some random description',
        },
      },
    } as Field], 1)).toBeUndefined()
  })

  it('should synchronise an organisme from an RnaField', async () => {
    expect(await service.synchroniseOrganismeFromFields([{
      id: 1,
      dsChampType: 'RnaChamp',
      stringValue: 'some-random-rna',
    } as Field], 1)).toEqual(42)
  })

  it('should synchronise an organisme from an RnfField', async () => {
    expect(await service.synchroniseOrganismeFromFields([{
      id: 1,
      dsChampType: 'RnfChamp',
      stringValue: 'some-random-rna',
    } as Field], 1)).toEqual(42)
  })

  it('should synchronise an organisme from an TextField with rnf code', async () => {
    expect(await service.synchroniseOrganismeFromFields([{
      id: 1,
      dsChampType: 'TextChamp',
      stringValue: 'some-random-rna',
      rawJson: {
        champDescriptor: {
          description: 'blablabla#bn-rnf-field-bn# blabla./bla',
        },
      },
    } as Field], 1)).toEqual(42)
  })
})
