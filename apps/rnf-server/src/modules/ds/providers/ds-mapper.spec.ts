import { Test, TestingModule } from '@nestjs/testing'
import { DsMapperService } from '@/modules/ds/providers/ds-mapper.service'
import { DossierWithCustomChamp } from '@dnum-mi/ds-api-client'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { loggerServiceMock } from '../../../../test/mocks/logger-service.mock'
import { dotationDossierDataMock } from '../../../../test/mocks/datas/dossier-dotation.data.mock'
import { entrepriseDossierDataMock } from '../../../../test/mocks/datas/dossier-entreprise.data.mock'
import { dnrDossierDataMock } from '../../../../test/mocks/datas/dossier-dnr.data.mock'
import { DsConfigurationService } from '@/modules/ds/providers/ds-configuration.service'
import { dsConfigurationServiceMock } from '../../../../test/mocks/ds-configuration-service.mock'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'

describe('DsMapperService & DsConfigurationService', () => {
  let service: DsMapperService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DsMapperService, DsConfigurationService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        }
        if (token === PrismaService) {
          return {
            dSConfiguration: {
              findFirst: jest
                .fn()
                .mockResolvedValue(dsConfigurationServiceMock.configuration),
            },
          }
        }
        return {}
      })
      .compile()

    service = module.get<DsMapperService>(DsMapperService)
    await module
      .get<DsConfigurationService>(DsConfigurationService)
      .onModuleInit()
  })

  it('Should throw error if Demarche doesnt exist or champs are empty', () => {
    const title = "!Je suis une démarche qui n'existe pas!"
    expect(() => {
      service.mapDossierToDto({
        demarche: {},
        champs: [],
      } as unknown as DossierWithCustomChamp)
    }).toThrow('Dossier champs is empty')
    expect(() => {
      service.mapDossierToDto({
        demarche: {},
        champs: [{}],
      } as unknown as DossierWithCustomChamp)
    }).toThrow('This demarche id is not implemented')
    expect(() => {
      service.mapDossierToDto({
        demarche: { title },
        champs: [{}],
      } as unknown as DossierWithCustomChamp)
    }).toThrow('This demarche id is not implemented')
  })

  it('Should correctly map a dotation foundation demarche', () => {
    const result = service.mapDossierToDto(
      dotationDossierDataMock as DossierWithCustomChamp,
    )
    expect(result).toEqual({
      title:
        'Je suis un titre compliqué avec des espaces et des accents et des MajUsCules',
      type: 'FDD',
      department: '33',
      address: {
        label: '11 Rue Pelleport 33800 Bordeaux',
        type: 'housenumber',
        streetAddress: '11 Rue Pelleport',
        streetNumber: '11',
        streetName: 'Rue Pelleport',
        postalCode: '33800',
        cityName: 'Bordeaux',
        cityCode: '33063',
        departmentName: 'Gironde',
        departmentCode: '33',
        regionName: 'Nouvelle-Aquitaine',
        regionCode: '33',
      },
      email: 'tata@gmail.com',
      declarationYears: [],
      phone: '06 86 46 54 45',
      originalCreatedAt: new Date('2024-07-09'),
      personInFoundationToCreate: [
        {
          person: {
            address: {
              cityCode: '75120',
              cityName: 'Paris',
              departmentCode: '75',
              departmentName: 'Paris',
              label: '1 Square Chauré 75020 Paris',
              postalCode: '75020',
              regionCode: '11',
              regionName: 'Île-de-France',
              streetAddress: '1 Square Chauré',
              streetName: 'Square Chauré',
              streetNumber: '1',
              type: 'housenumber',
            },
            bornAt: new Date('2024-04-05'),
            bornPlace: 'Courbevoie (92400)',
            firstName: 'Pierre',
            lastName: 'Jean',
            nationality: 'France',
            phone: '',
            profession: 'president',
          },
          role: undefined,
        },
      ],
    })
  })

  it('Should correctly map a entreprise demarche', () => {
    const result = service.mapDossierToDto(
      entrepriseDossierDataMock as DossierWithCustomChamp,
    )
    expect(result).toMatchObject({
      title: 'Test demo',
      type: 'FE',
      address: {
        label: '1 Square Wannoschot 59800 Lille',
        type: 'housenumber',
        streetAddress: '1 Square Wannoschot',
        streetNumber: '1',
        streetName: 'Square Wannoschot',
        postalCode: '59800',
        cityName: 'Lille',
        cityCode: '59350',
        departmentName: 'Nord',
        departmentCode: '59',
        regionName: 'Hauts-de-France',
        regionCode: '32',
      },
    })
  })

  it('Should correctly map a demande numéro rnf demarche', () => {
    const result = service.mapDossierToDto(
      dnrDossierDataMock as DossierWithCustomChamp,
    )
    expect(result).toMatchObject({
      title: 'Fondation des tulipes',
      type: 'FRUP',
      address: {
        label: '3 Rue Colbert 59800 Lille',
        type: 'housenumber',
        streetAddress: '3 Rue Colbert',
        streetNumber: '3',
        streetName: 'Rue Colbert',
        postalCode: '59800',
        cityName: 'Lille',
        cityCode: '59350',
        departmentName: 'Nord',
        departmentCode: '59',
        regionName: 'Hauts-de-France',
        regionCode: '32',
      },
      email: 'tulipe@gmail.com',
      phone: '07 89 89 89 89',
      originalCreatedAt: new Date('1001-01-01'),
    })
  })
})
