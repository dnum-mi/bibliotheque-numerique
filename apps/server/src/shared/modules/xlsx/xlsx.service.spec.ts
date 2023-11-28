import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { ConfigModule } from '@nestjs/config'
import excelImportConfig from '@/config/excel-import.config'
import { FileService } from '@/modules/files/providers/file.service'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'

describe('XlsxService', () => {
  let service: XlsxService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [excelImportConfig],
        }),
      ],
      controllers: [],
      providers: [XlsxService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === FileService) {
          return {
            getFile: jest.fn().mockImplementation((a) => a),
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
    expect(service._cleanData(data as never[][])).toMatchObject(
      [
        [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
        [45288, 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      ],
    )
  })

  it('should readExcelFile with data', async () => {
    const result =
      await service.readExcelFile('test/mock/excel-service/data/DeclarationFinancementsEtrangers.xlsx')
    expect(result).toMatchObject(
      [
        [
          45288, // Date save by execl in number foramt
          'PM',
          'AUTRICHE',
          'RP',
          'D',
          'C',
          5600,
        ],
      ],
    )
  })
})
