import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { ExcelService } from '@/modules/dossiers/providers/excel.service'
import { ConfigModule } from '@nestjs/config'
import excelImportConfig from '@/config/excel-import.config'
import { FileService } from '@/modules/files/providers/file.service'

describe('ExcelService', () => {
  let service: ExcelService

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
      providers: [ExcelService],
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

    service = module.get<ExcelService>(ExcelService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should clean data', () => {
    const data = [
      ['11/11/2022', 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      ['11/11/2022', 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      [],
      [],
    ]
    expect(service._cleanData(data as never[][])).toMatchObject(
      [
        ['11/11/2022', 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
        ['11/11/2022', 'Afghanistan', 'AUTRICHE', 'D', 'VB', 1000],
      ],
    )
  })

  it('should readExcelFile with data', async () => {
    const result =
      await service.readExcelFile('test/mock/excel-service/data/DeclarationFinancementsEtrangers.xlsx')
    expect(result).toMatchObject(
      [
        [
          '11/11/2022',
          'Afghanistan',
          'AUTRICHE',
          'D',
          'VB',
          undefined,
          1000,
        ],
      ],
    )
  })
})
