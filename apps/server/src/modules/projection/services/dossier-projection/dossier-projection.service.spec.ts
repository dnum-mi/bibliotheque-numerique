import { Test, TestingModule } from '@nestjs/testing';
import { DossierProjectionService } from './dossier-projection.service';
import { FieldType } from '@biblio-num/shared'
import { DataSource } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../test/mock/logger-service.mock'

describe('DossierProjectionService', () => {
  let service: DossierProjectionService;
  let dataSource: DataSource

  const mockDataSource: Partial<DataSource> = {
    query: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DossierProjectionService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile()

    service = module.get<DossierProjectionService>(DossierProjectionService)
    dataSource = module.get<DataSource>(DataSource)

    jest.clearAllMocks()
  })

  describe('createTable', () => {
    it('should generate correct SQL for table creation', async () => {
      const demarche = {
        id: 24,
        title: 'Test Demarche',
        mappingColumns: [
          {
            id: 'simple-id',
            type: FieldType.string,
          },
          {
            id: 'parent',
            type: FieldType.string,
            children: [
              {
                id: 'child-1',
                type: FieldType.number,
              },
            ],
          },
        ],
      } as any

      await service.createTable(demarche)

      expect(dataSource.query).toHaveBeenCalledTimes(1)

      const executedQuery = (mockDataSource.query as jest.Mock).mock.calls[0][0]
      expect(executedQuery).toContain('DROP TABLE IF EXISTS')
      expect(executedQuery).toContain('CREATE TABLE')
      expect(executedQuery).toContain('"dossierId" integer PRIMARY KEY')
      expect(executedQuery).toContain('"simple-id" text[]')
      expect(executedQuery).toContain('"child-1" numeric[]')
    })
  })
});
