import { mapFieldTypeToSql } from '@/modules/projection/utils/projection-utils'
import { FieldType } from '@biblio-num/shared'

describe('_mapFieldTypeToSql', () => {
  it('should map field types correctly', () => {
    expect(mapFieldTypeToSql(FieldType.string)).toBe('text')
    expect(mapFieldTypeToSql(FieldType.enum)).toBe('text')
    expect(mapFieldTypeToSql(FieldType.number)).toBe('numeric')
    expect(mapFieldTypeToSql(FieldType.boolean)).toBe('text')
    expect(mapFieldTypeToSql(FieldType.date)).toBe('timestamp')
  })

  it('should throw on unsupported type', () => {
    expect(() =>
      mapFieldTypeToSql('toto' as any),
    ).toThrow()
  })
})
