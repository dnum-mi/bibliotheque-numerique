import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DataFormatterService } from './data-formatter.service'
import { DossierTransformerService } from './dossier-transformer.service'
import { FieldBuilderService } from './field-builder.service'
import { FileBuilderService } from './file-builder.service'
import { Test, TestingModule } from '@nestjs/testing'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { maarchChampsLabel } from '@/modules/demarches/objects/constants/maarch-champ.enum'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { File } from '@/modules/files/objects/entities/file.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { DossierState } from '@dnum-mi/ds-api-client'

describe('DossierTransformerService', () => {
  let service: DossierTransformerService
  let fieldBuilder: FieldBuilderService
  let fileBuilder: FileBuilderService
  let dataFormatter: DataFormatterService
  let logger: LoggerService

  const mockFieldBuilder = {
    createSimpleField: jest.fn(),
    createRepeatableFields: jest.fn(),
  }

  const mockFileBuilder = {
    createFileEntities: jest.fn(),
  }

  const mockDataFormatter = {
    getPrefectureKey: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DossierTransformerService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: FieldBuilderService,
          useValue: mockFieldBuilder,
        },
        {
          provide: FileBuilderService,
          useValue: mockFileBuilder,
        },
        {
          provide: DataFormatterService,
          useValue: mockDataFormatter,
        },
      ],
    }).compile()

    service = module.get<DossierTransformerService>(DossierTransformerService)
    fieldBuilder = module.get<FieldBuilderService>(FieldBuilderService)
    fileBuilder = module.get<FileBuilderService>(FileBuilderService)
    dataFormatter = module.get<DataFormatterService>(DataFormatterService)
    logger = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('transformToEntities', () => {
    const mockDemarche: Demarche = {
      id: 1,
      title: 'Test Demarche',
    } as Demarche

    const mockAggregatedData = [
      {
        [maarchChampsLabel.etatDossier]: DossierState.Accepte,
        [maarchChampsLabel.prefecture]: 'D75',
        pieces_jointes: [],
        annotations: [],
      },
      {
        [maarchChampsLabel.etatDossier]: DossierState.SansSuite,
        [maarchChampsLabel.prefecture]: 'D92',
        pieces_jointes: [],
        annotations: [],
      },
    ]

    const mockField1 = new Field()
    mockField1.sourceId = 'field1'
    mockField1.stringValue = 'value1'

    const mockField2 = new Field()
    mockField2.sourceId = 'field2'
    mockField2.stringValue = 'value2'

    const mockFile = new File()
    mockFile.label = 'test.pdf'

    beforeEach(() => {
      mockFieldBuilder.createSimpleField.mockReturnValue(mockField1)
      mockFieldBuilder.createRepeatableFields.mockReturnValue([mockField2])
      mockFileBuilder.createFileEntities.mockReturnValue([mockFile])
      mockDataFormatter.getPrefectureKey.mockImplementation((pref) => pref)
    })

    it('should transform aggregated data to dossier entities', async () => {
      const result = await service.transformToEntities(
        mockAggregatedData,
        mockDemarche,
      )

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Dossier)
      expect(result[1]).toBeInstanceOf(Dossier)
      expect(result[0].demarcheId).toBe(mockDemarche.id)
      expect(result[0].state).toBe(DossierState.Accepte)
      expect(result[0].prefecture).toBe('D75')
      expect(result[1].prefecture).toBe('D92')
    })

    it('should create fields for each dossier', async () => {
      const result = await service.transformToEntities(
        mockAggregatedData,
        mockDemarche,
      )

      expect(mockFieldBuilder.createSimpleField).toHaveBeenCalled()
      expect(mockFieldBuilder.createRepeatableFields).toHaveBeenCalled()

      expect(result[0].fields).toBeDefined()
      expect(result[0].fields.length).toBeGreaterThan(0)
    })

    it('should create files for each dossier', async () => {
      const result = await service.transformToEntities(
        mockAggregatedData,
        mockDemarche,
      )

      expect(mockFileBuilder.createFileEntities).toHaveBeenCalledTimes(2)
      expect(mockFileBuilder.createFileEntities).toHaveBeenCalledWith(
        mockAggregatedData[0],
      )
      expect(mockFileBuilder.createFileEntities).toHaveBeenCalledWith(
        mockAggregatedData[1],
      )

      expect(result[0].files).toEqual([mockFile])
      expect(result[1].files).toEqual([mockFile])
    })

    it('should handle empty aggregated data', async () => {
      const result = await service.transformToEntities(
        [],
        mockDemarche,
      )

      expect(result).toEqual([])
      expect(mockFieldBuilder.createSimpleField).not.toHaveBeenCalled()
      expect(mockFileBuilder.createFileEntities).not.toHaveBeenCalled()
    })

    it('should handle null prefecture', async () => {
      mockDataFormatter.getPrefectureKey.mockReturnValue(null)

      const dataWithNullPrefecture = [
        {
          [maarchChampsLabel.prefecture]: null,
          pieces_jointes: [],
          annotations: [],
        },
      ]

      const result = await service.transformToEntities(
        dataWithNullPrefecture,
        mockDemarche,
      )

      expect(result[0].prefecture).toBeNull()
    })

    it('should handle fields that return null', async () => {
      let callCount = 0
      mockFieldBuilder.createSimpleField.mockImplementation(() => {
        callCount++
        if (callCount === 1) return mockField1
        if (callCount === 3) return mockField2
        return null
      })

      mockFieldBuilder.createRepeatableFields.mockReturnValue(null)

      const result = await service.transformToEntities(
        [mockAggregatedData[0]],
        mockDemarche,
      )

      const nonNullFields = result[0].fields.filter((f) => f !== null)
      expect(nonNullFields).toHaveLength(2)
      expect(nonNullFields).toContain(mockField1)
      expect(nonNullFields).toContain(mockField2)
    })

    it('should handle complex nested data structure', async () => {
      const complexData = [
        {
          [maarchChampsLabel.prefecture]: 'D75',
          pieces_jointes: [
            { nom: 'doc1.pdf', intitule: 'Document 1' },
            { nom: 'doc2.pdf', intitule: 'Document 2' },
          ],
          annotations: ['Note 1', 'Note 2', 'Note 3'],
          customField: 'customValue',
        },
      ]

      const parentField = new Field()
      parentField.sourceId = 'parent'

      const childFields = [
        Object.assign(new Field(), { sourceId: 'child1' }),
        Object.assign(new Field(), { sourceId: 'child2' }),
      ]

      mockFieldBuilder.createRepeatableFields.mockReturnValue([
        parentField,
        ...childFields,
      ])

      const result = await service.transformToEntities(
        complexData,
        mockDemarche,
      )

      expect(result[0]).toBeDefined()
      expect(mockFieldBuilder.createRepeatableFields).toHaveBeenCalled()
    })
  })
})
