import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Repository } from 'typeorm'
import { faker } from '@faker-js/faker'

import {
  eFileDsSourceLabel,
  eState,
  FieldType,
  fileExtensions,
} from '@biblio-num/shared'
import {
  Champ,
  PieceJustificativeChamp,
  File as IFile,
  CustomChamp,
} from '@dnum-mi/ds-api-client'

import { DossierService } from './dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { getFakeDossierTest } from '../../../../test/unit/fake-data/dossier.fake-data'
import { File } from '../../files/objects/entities/file.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

describe('dossier.service', () => {
  let service
  beforeAll(() => {
    const repository: Repository<Dossier> = jest.createMockFromModule(
      'typeorm/repository/Repository',
    )
    const loggerService: LoggerService =
      jest.createMockFromModule<LoggerService>(
        '@/shared/modules/logger/logger.service',
      )
    const fieldService: FieldService = jest.createMockFromModule<FieldService>(
      '@/modules/dossiers/providers/field.service',
    )
    loggerService.setContext = jest.fn()
    loggerService.verbose = jest.fn()

    service = new DossierService(repository, fieldService, loggerService)
  })

  it('Should have new value in url of files', () => {
    const generateDsFile = (): IFile =>
      ({
        checksum: faker.string.alpha(),
        url: faker.internet.url(),
      }) as IFile
    const firstFile = generateDsFile()
    const pieceJustificativeChampMock: PieceJustificativeChamp = {
      __typename: 'PieceJustificativeChamp',
      id: faker.string.alphanumeric(),
      file: firstFile,
      files: [firstFile, generateDsFile()],
    } as PieceJustificativeChamp
    const champMock1: Champ = {
      __typename: 'Champ',
      id: faker.string.alphanumeric(),
      label: faker.string.alphanumeric(),
    }
    const dossierMock = getFakeDossierTest({
      champs: [champMock1, pieceJustificativeChampMock as Champ],
    })

    const generateFile = (index): File =>
      ({
        sourceIndex: index,
        sourceLabel: eFileDsSourceLabel['ds-champ'],
        sourceStringId: pieceJustificativeChampMock.id,
        uuid: faker.string.uuid(),
      }) as File
    const filesMock: File[] = [
      {
        ...generateFile(1),
        checksum: pieceJustificativeChampMock.files[1].checksum,
      },
      {
        ...generateFile(0),
        checksum: pieceJustificativeChampMock.files[0].checksum,
      },
    ]
    const result = service.transformValueFileOfDossier(dossierMock, filesMock)
    expect(result.dsDataJson.champs[1].file.url).toBe(filesMock[1].uuid)
  })

  describe('Reconstruct fields with mapping', () => {
    it('should exclude items with sourceId "fix-field"', async () => {
      const mapping: MappingColumn[] = [
        {
          id: '1',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Label 1',
        },
        {
          id: '2',
          source: 'fix-field',
          isHeader: false,
          originalLabel: 'Fixed',
        },
        {
          id: '3',
          source: 'annotations',
          isHeader: false,
          originalLabel: 'Label 3',
        },
      ]

      const fields: Partial<Field>[] = [
        {
          id: 1,
          sourceId: '1',
          fieldSource: 'champs',
          type: FieldType.string,
          stringValue: 'Value 1',
        },
        {
          id: 2,
          sourceId: '2',
          fieldSource: 'fix-field',
          type: FieldType.string,
          stringValue: 'Fixed',
        },
        {
          id: 3,
          sourceId: '3',
          fieldSource: 'annotations',
          type: FieldType.string,
          stringValue: 'Value 3',
        },
      ]

      const result = await service._reconstructFieldsWithMapping(
        mapping,
        fields,
      )

      expect(result.champs).toHaveLength(1)
      expect(result.annotations).toHaveLength(1)
      expect(result.champs[0].items).not.toContainEqual(
        expect.objectContaining({ id: '2' }),
      )
    })

    it('should create groups during the headers meeting', async () => {
      const mapping: MappingColumn[] = [
        {
          id: 'h1',
          source: 'champs',
          isHeader: true,
          originalLabel: 'Groupe 1',
        },
        {
          id: '1',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Field 1',
        },
        {
          id: 'h2',
          source: 'champs',
          isHeader: true,
          originalLabel: 'Groupe 2',
        },
        {
          id: '2',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Field 2',
        },
      ]

      const fields: Partial<Field>[] = [
        {
          id: 1,
          sourceId: '1',
          type: FieldType.string,
          stringValue: 'Value 1',
        },
        {
          id: 2,
          sourceId: '2',
          type: FieldType.string,
          stringValue: 'Value 2',
        },
      ]

      const result = await service._reconstructFieldsWithMapping(
        mapping,
        fields,
      )

      expect(result.champs).toHaveLength(2)
      expect(result.champs[0].title).toBe('Groupe 1')
      expect(result.champs[0].items).toHaveLength(1)
      expect(result.champs[1].title).toBe('Groupe 2')
      expect(result.champs[1].items).toHaveLength(1)
    })

    it('should create a default group if no header is defined', async () => {
      const mapping: MappingColumn[] = [
        {
          id: '1',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Field 1',
        },
        {
          id: '2',
          source: 'annotations',
          isHeader: false,
          originalLabel: 'Field 2',
        },
      ]

      const fields: Partial<Field>[] = [
        {
          id: 1,
          sourceId: '1',
          type: FieldType.string,
          stringValue: 'Value 1',
        },
        {
          id: 2,
          sourceId: '2',
          type: FieldType.string,
          stringValue: 'Value 2',
        },
      ]

      const result = await service._reconstructFieldsWithMapping(
        mapping,
        fields,
      )

      expect(result.champs).toHaveLength(1)
      expect(result.champs[0].id).toBe('default-champs')
      expect(result.champs[0].title).toBe('Informations Générales')

      expect(result.annotations).toHaveLength(1)
      expect(result.annotations[0].id).toBe('default-annotations')
      expect(result.annotations[0].title).toBe('Annotations Générales')
    })

    it('devrait convertir correctement les valeurs', async () => {
      const fileData = {
        url: 'http://example.com/file.pdf',
        name: 'file.pdf',
      } as Partial<CustomChamp>
      const mapping: MappingColumn[] = [
        {
          id: '1',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Bool Field',
          type: 'boolean',
        },
        {
          id: '2',
          source: 'champs',
          isHeader: false,
          originalLabel: 'File Field',
          type: 'file',
        },
        {
          id: '3',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Text Field',
          type: 'string',
        },
        {
          id: '4',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Number Field',
          type: 'number',
        },
      ]

      const fields: Partial<Field>[] = [
        { id: 1, sourceId: '1', type: FieldType.boolean, stringValue: 'true' },
        {
          id: 2,
          sourceId: '2',
          type: FieldType.file,
          stringValue: null,
          rawJson: fileData,
        },
        { id: 3, sourceId: '3', type: FieldType.string, stringValue: 'Hello' },
        { id: 4, sourceId: '4', type: FieldType.number, stringValue: '42' },
      ]

      const result = await service._reconstructFieldsWithMapping(
        mapping,
        fields,
      )

      expect(result.champs[0].items[0].value).toBe(true)
      expect(result.champs[0].items[1].value).toEqual(fileData)
      expect(result.champs[0].items[2].value).toBe('Hello')
      expect(result.champs[0].items[3].value).toBe('42')
    })

    it('devrait traiter correctement les champs avec enfants', async () => {
      const mapping: MappingColumn[] = [
        {
          id: 'parent1',
          source: 'champs',
          isHeader: false,
          originalLabel: 'Parent Field',
          children: [
            { id: 'child1', source: 'champs', originalLabel: 'Child 1', type: 'string' },
            { id: 'child2', source: 'champs', originalLabel: 'Child 2', type: 'number' },
          ],
        },
      ]

      const fields: Partial<Field>[] = [
        { id: 1, sourceId: 'parent1', type: 'string', stringValue: null },
        {
          id: 2,
          sourceId: 'child1',
          parentId: 1,
          parentRowIndex: 0,
          type: 'string',
          stringValue: 'Row 1 Child 1',
        },
        {
          id: 3,
          sourceId: 'child2',
          parentId: 1,
          parentRowIndex: 0,
          type: 'number',
          stringValue: '10',
        },
        {
          id: 4,
          sourceId: 'child1',
          parentId: 1,
          parentRowIndex: 1,
          type: 'string',
          stringValue: 'Row 2 Child 1',
        },
        {
          id: 5,
          sourceId: 'child2',
          parentId: 1,
          parentRowIndex: 1,
          type: 'number',
          stringValue: '20',
        },
      ]

      const result = await service._reconstructFieldsWithMapping(
        mapping,
        fields,
      )

      const groupItem = result.champs[0].items[0]
      expect(groupItem.type).toBe('group')
      expect(groupItem.rows).toHaveLength(2)

      expect(groupItem.rows[0]).toHaveLength(2)
      expect(groupItem.rows[0][0].value).toBe('Row 1 Child 1')
      expect(groupItem.rows[0][1].value).toBe('10')

      expect(groupItem.rows[1]).toHaveLength(2)
      expect(groupItem.rows[1][0].value).toBe('Row 2 Child 1')
      expect(groupItem.rows[1][1].value).toBe('20')
    })
  })
})
