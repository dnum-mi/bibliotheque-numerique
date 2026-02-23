import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { FieldProjectionService } from './field-projection.service'
import { FieldType } from '@biblio-num/shared'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../test/mock/logger-service.mock'

describe('FieldProjectionService', () => {
  let service: FieldProjectionService
  let dataSource: DataSource

  const mockDataSource: Partial<DataSource> = {
    query: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldProjectionService,
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

    service = module.get<FieldProjectionService>(FieldProjectionService)
    dataSource = module.get<DataSource>(DataSource)

    jest.clearAllMocks()
  })

  describe('_flattenMappingColumns', () => {
    it('should flatten children and ignore headers', () => {
      const mockMapping = [
        {
          id: 'header-id',
          type: FieldType.string,
          isHeader: true,
        },
        {
          id: 'simple-id',
          type: FieldType.enum,
          isHeader: false,
        },
        {
          id: 'parent-id',
          type: FieldType.string,
          children: [
            {
              id: 'child-1',
              type: FieldType.string,
            },
            {
              id: 'child-2',
              type: FieldType.number,
            },
          ],
        },
      ] as any

      const result = service['_flattenMappingColumns'](mockMapping)

      expect(result).toEqual([
        { id: 'simple-id', type: 'text' },
        { id: 'child-1', type: 'text' },
        { id: 'child-2', type: 'numeric' },
      ])
    })
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
      expect(executedQuery).toContain('"simple-id" text')
      expect(executedQuery).toContain('"child-1" numeric')
      expect(executedQuery).toContain('PRIMARY KEY (dossierId, projectionRowIndex)')
    })
  })
})
