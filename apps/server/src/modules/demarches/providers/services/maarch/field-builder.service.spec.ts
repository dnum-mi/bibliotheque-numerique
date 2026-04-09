import { Test, TestingModule } from '@nestjs/testing'
import { FieldBuilderService } from './field-builder.service'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { FieldSource, FieldType } from '@biblio-num/shared'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { DemandeAggregee } from '@/modules/demarches/objects/constants/maarch.types'
import { maarchPJLabel } from '@/modules/demarches/objects/constants/maarch-champ.enum'

describe('FieldBuilderService', () => {
  let service: FieldBuilderService
  const emptyMap = new Map<string, string>()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldBuilderService],
    }).compile()

    service = module.get<FieldBuilderService>(FieldBuilderService)
  })

  describe('createSimpleField', () => {
    const baseMappingColumn: MappingColumn = {
      id: 'field-1',
      originalLabel: 'original_field',
      columnLabel: 'Field Label',
      type: FieldType.string,
      formatFunctionRef: 'format_func',
      source: FieldSource.champs,
    }

    const dataDemande = (value: any): DemandeAggregee => ({
      original_field: value,
      pieces_jointes: [],
      annotations: [],
      accuses_reception: []
    })

    it('should create a simple string field', () => {
      const data = dataDemande('test value')

      const result = service.createSimpleField(baseMappingColumn, data, emptyMap)

      expect(result).toBeInstanceOf(Field)
      expect(result?.label).toBe('Field Label')
      expect(result?.sourceId).toBe('field-1')
      expect(result?.type).toBe(FieldType.string)
      expect(result?.stringValue).toBe('test value')
      expect(result?.dsChampType).toBe(DsChampType.TextChamp)
      expect(result?.formatFunctionRef).toBe('format_func')
    })

    it('should use originalLabel when columnLabel is not provided', () => {
      const mapping = { ...baseMappingColumn, columnLabel: undefined }
      const data = dataDemande('test')

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.label).toBe('original_field')
    })

    it('should create a number field', () => {
      const mapping = { ...baseMappingColumn, type: FieldType.number }
      const data = dataDemande('42.5')

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.type).toBe(FieldType.number)
      expect(result?.numberValue).toBe('42.5')
      expect(result?.stringValue).toBe('42.5')
    })

    it('should create a date field', () => {
      const testDate = new Date('2024-01-15T10:00:00Z')
      const mapping = { ...baseMappingColumn, type: FieldType.date }
      const data = dataDemande(testDate)

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.type).toBe(FieldType.date)
      expect(result?.dateValue).toEqual(testDate)
      expect(result?.stringValue).toBe('15/01/2024')
    })

    it('should create a boolean field', () => {
      const mapping = { ...baseMappingColumn, type: FieldType.boolean }
      const data = dataDemande(true)

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.type).toBe(FieldType.boolean)
      expect(result?.stringValue).toBe('true')
    })

    it('should return null for null values', () => {
      const data = dataDemande(null)
      const result = service.createSimpleField(baseMappingColumn, data, emptyMap)

      expect(result).toBeNull()
    })

    it('should return null for undefined values', () => {
      const data = {
        different_field: 'value',
        pieces_jointes: [],
        annotations: [],
        accuses_reception: []
      }
      const result = service.createSimpleField(baseMappingColumn, data, emptyMap)

      expect(result).toBeNull()
    })

    it('should return null for invalid date', () => {
      const mapping = { ...baseMappingColumn, type: FieldType.date }
      const data = dataDemande('invalid-date')

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.stringValue).toBe('invalid-date')
    })

    it('should handle NaN for number fields', () => {
      const mapping = { ...baseMappingColumn, type: FieldType.number }
      const data = dataDemande('not-a-number')

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result?.numberValue).toBeUndefined()
      expect(result?.stringValue).toBe('not-a-number')
    })

    it('should handle zero values correctly', () => {
      const mapping = { ...baseMappingColumn, type: FieldType.number }
      const data = dataDemande(0)

      const result = service.createSimpleField(mapping, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result?.numberValue).toBe('0')
      expect(result?.stringValue).toBe('0')
    })

    it('should handle empty string for string fields', () => {
      const data = dataDemande('')
      const result = service.createSimpleField(baseMappingColumn, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result?.stringValue).toBe('')
    })

    it('should inject UUID into stringValue for a simple file field', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const filename = 'courrier.pdf'

      const fileMapping: MappingColumn = {
        ...baseMappingColumn,
        type: FieldType.file,
      }

      const data = dataDemande(filename)

      const uuidMap = new Map<string, string>()
      uuidMap.set(filename, uuid)

      const result = service.createSimpleField(fileMapping, data, uuidMap)

      expect(result?.type).toBe(FieldType.file)
      expect(result?.dsChampType).toBe(DsChampType.PieceJustificativeChamp)
      expect(result?.stringValue).toBe(uuid)
    })

    it('should fallback to filename if UUID is missing in Map for file field', () => {
      const filename = 'unknown.pdf'
      const fileMapping: MappingColumn = { ...baseMappingColumn, type: FieldType.file }
      const data = dataDemande(filename)

      const result = service.createSimpleField(fileMapping, data, emptyMap)

      expect(result?.stringValue).toBe("")
    })
  })

  describe('createRepeatableFields', () => {
    const parentMapping: MappingColumn = {
      id: 'parent-field',
      originalLabel: 'pieces_jointes',
      columnLabel: 'Pièces Jointes',
      type: FieldType.string,
      source: FieldSource.champs,
      children: [
        {
          id: 'child-1',
          originalLabel: 'nom_fichier',
          columnLabel: 'Nom du fichier',
          type: FieldType.string,
          source: FieldSource.champs,
        },
        {
          id: 'child-2',
          originalLabel: 'taille',
          columnLabel: 'Taille',
          type: FieldType.number,
          source: FieldSource.champs,
        },
      ],
    }

    it('should create parent and child fields', () => {
      const data: DemandeAggregee = {
        pieces_jointes: [
          { nom_fichier: 'doc1.pdf', taille: 1024 },
          { nom_fichier: 'doc2.pdf', taille: 2048 },
        ],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(parentMapping, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(5)

      const parentField = result![0]
      expect(parentField.sourceId).toBe('parent-field')
      expect(parentField.label).toBe('Pièces Jointes')
      expect(parentField.stringValue).toBe('Pièces Jointes')
      expect(parentField.dsChampType).toBe(DsChampType.RepetitionChamp)

      const firstRowChildren = result!.filter(
        (f) => f.parentRowIndex === 0 && f.parent,
      )
      expect(firstRowChildren).toHaveLength(2)
      expect(firstRowChildren[0].stringValue).toBe('doc1.pdf')
      expect(firstRowChildren[1].numberValue).toBe('1024')

      const secondRowChildren = result!.filter(
        (f) => f.parentRowIndex === 1 && f.parent,
      )
      expect(secondRowChildren).toHaveLength(2)
      expect(secondRowChildren[0].stringValue).toBe('doc2.pdf')
      expect(secondRowChildren[1].numberValue).toBe('2048')
    })

    it('should return null for empty array', () => {
      const data: DemandeAggregee = { pieces_jointes: [], annotations: [], accuses_reception: [] }
      const result = service.createRepeatableFields(parentMapping, data, emptyMap)

      expect(result).toBeNull()
    })

    it('should skip child fields with null values', () => {
      const data = {
        pieces_jointes: [
          { nom_fichier: 'doc1.pdf', taille: null },
          { nom_fichier: null, taille: 2048 },
        ],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(parentMapping, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(3)
    })

    it('should handle date fields in children', () => {
      const mappingWithDate: MappingColumn = {
        ...parentMapping,
        children: [
          {
            id: 'child-date',
            originalLabel: 'date_creation',
            type: FieldType.date,
            source: FieldSource.champs,
          },
        ],
      }

      const testDate = new Date('2024-01-15')
      const data: DemandeAggregee = {
        pieces_jointes: [{ date_creation: testDate }],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(mappingWithDate, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(2)

      const childField = result![1]
      expect(childField.dateValue).toEqual(testDate)
      expect(childField.stringValue).toBe('15/01/2024')
    })

    it('should handle missing child mappings', () => {
      const mappingNoChildren = { ...parentMapping, children: undefined }
      const data: DemandeAggregee = {
        pieces_jointes: [{ nom_fichier: 'test.pdf' }],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(mappingNoChildren, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(1)
    })

    it('should set correct parent relationships', () => {
      const data: DemandeAggregee = {
        pieces_jointes: [{ nom_fichier: 'doc.pdf', taille: 1024 }],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(parentMapping, data, emptyMap)

      const parentField = result![0]
      const childFields = result!.slice(1)

      childFields.forEach((child) => {
        expect(child.parent).toBe(parentField)
        expect(child.parentRowIndex).toBe(0)
      })
    })

    it('should handle boolean fields in children', () => {
      const mappingWithBoolean: MappingColumn = {
        ...parentMapping,
        children: [
          {
            id: 'child-bool',
            originalLabel: 'is_validated',
            type: FieldType.boolean,
            source: FieldSource.champs
          },
        ],
      }

      const data: DemandeAggregee = {
        pieces_jointes: [{ is_validated: true }, { is_validated: false }],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(mappingWithBoolean, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(3)

      expect(result![1].stringValue).toBe('true')
      expect(result![2].stringValue).toBe('false')
    })

    it('should handle complex nested data', () => {
      const complexMapping: MappingColumn = {
        id: 'complex-parent',
        originalLabel: 'complex_data',
        type: FieldType.string,
        source: FieldSource.champs,
        children: [
          { id: 'c1', originalLabel: 'field1', type: FieldType.string, source: FieldSource.champs },
          { id: 'c2', originalLabel: 'field2', type: FieldType.number, source: FieldSource.champs },
          { id: 'c3', originalLabel: 'field3', type: FieldType.date, source: FieldSource.champs },
          { id: 'c4', originalLabel: 'field4', type: FieldType.boolean, source: FieldSource.champs },
        ],
      }

      const data: DemandeAggregee = {
        complex_data: [
          {
            field1: 'value1',
            field2: 42,
            field3: new Date('2024-01-15'),
            field4: true,
          },
          {
            field1: 'value2',
            field2: 84,
            field3: new Date('2024-01-16'),
            field4: false,
          },
        ],
        pieces_jointes: [],
        annotations: [],
        accuses_reception: []
      }

      const result = service.createRepeatableFields(complexMapping, data, emptyMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(9)

      const parentField = result![0]
      const childFields = result!.slice(1)

      childFields.forEach((child) => {
        expect(child.parent).toBe(parentField)
        expect([0, 1]).toContain(child.parentRowIndex)
      })
    })

    it('should inject UUID for child FILE fields (PJs)', () => {
      const pjUuid = 'uuid-pj-999'
      const pjName = '90_99999.pdf'

      const mappingWithFileChild: MappingColumn = {
        ...parentMapping,
        children: [
          {
            id: 'child-pj',
            originalLabel: maarchPJLabel.nomPj,
            type: FieldType.file,
            source: FieldSource.champs,
          },
        ],
      }

      const data = {
        pieces_jointes: [
          { [maarchPJLabel.nomPj]: pjName },
        ],
        annotations: [],
        accuses_reception: []
      }

      const uuidMap = new Map<string, string>()
      uuidMap.set(pjName, pjUuid)

      const result = service.createRepeatableFields(mappingWithFileChild, data, uuidMap)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(2)

      const childField = result![1]
      expect(childField.type).toBe(FieldType.file)
      expect(childField.stringValue).toBe(pjUuid)
    })

    it('should handle repeatable fields for Accusés de Réception', () => {
      const mappingAccuses: MappingColumn = {
        id: 'accuse-parent',
        originalLabel: 'accuses_reception',
        columnLabel: 'Accusés',
        type: FieldType.string,
        source: FieldSource.champs,
        children: [{
          id: 'accuse-file',
          originalLabel: 'filename',
          type: FieldType.file,
          source: FieldSource.champs,
        }],
      }

      const data: DemandeAggregee = {
        pieces_jointes: [],
        annotations: [],
        accuses_reception: [
          { filename: 'accuse1.html', path: 'path1' },
          { filename: 'accuse2.html', path: 'path2' }
        ]
      }

      const result = service.createRepeatableFields(mappingAccuses, data, emptyMap)

      expect(result).toHaveLength(3)
      expect(result![1].parent).toBe(result![0])
    })
  })
})
