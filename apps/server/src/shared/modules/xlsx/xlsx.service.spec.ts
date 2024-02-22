import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { eBnConfiguration } from '@biblio-num/shared'
import { S3Service } from '@/shared/modules/s3/s3.service'

const AMOUNT_CHAMP_ID = 'Q2hhbXAtNTg='
const SHEET_NAME = 'Déclaration des FE'
const RANGE = 'B4:H502'

describe('XlsxService', () => {
  let service: XlsxService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [XlsxService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === BnConfigurationService) {
          return {
            findByKeyName: jest.fn().mockImplementation((keyName: string) => {
              if (keyName === eBnConfiguration.FE_EXCEL_AMOUNT_CHAMP_ID) {
                return Promise.resolve({ stringValue: AMOUNT_CHAMP_ID })
              }
              if (keyName === eBnConfiguration.FE_EXCEL_IMPORT_SHEET_NAME) {
                return Promise.resolve({ stringValue: SHEET_NAME })
              }
              if (keyName === eBnConfiguration.FE_EXCEL_IMPORT_RANGE) {
                return Promise.resolve({ stringValue: RANGE })
              }
            }),
          }
        } else if (token === S3Service) {
          return {
            getStreamedFile: jest.fn().mockImplementation((a) => a),
          }
        }
      })
      .compile()

    service = module.get<XlsxService>(XlsxService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should clean data', () => {
    const data = [
      [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      [],
      [],
    ]
    expect(service._cleanData(data as never[][])).toMatchObject([
      [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
    ])
  })

  it('should readExcelFile with data', async () => {
    const result = await service.readExcelFile(
      'test/mock/excel-service/data/DeclarationFinancementsEtrangers.xlsx',
    )
    expect(result).toMatchObject([
      [
        45288, // Date save by excel in number format
        'PM',
        'AUTRICHE',
        'RP',
        'D',
        'C',
        5600,
      ],
    ])
  })
})
