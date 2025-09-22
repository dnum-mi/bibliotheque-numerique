import { maarchChampsLabel, maarchPJLabel } from '@/modules/demarches/objects/constants/maarch-champ.enum'
import {
  CsvRow,
  DemandeAggregee,
} from '@/modules/demarches/objects/constants/maarch.types'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import {
  FieldType,
  PrefectureDictionary,
  PrefectureKey,
} from '@biblio-num/shared'
import { Injectable } from '@nestjs/common'
import { createFileRawValue } from './utils/file-helper'

@Injectable()
export class FieldBuilderService {
  createSimpleField(
    mapping: MappingColumn,
    data: DemandeAggregee,
  ): Field | null {
    const rawValue = data[mapping.originalLabel]

    if (this._isNullOrUndefined(rawValue)) {
      return null
    }

    const field = this._initializeField(mapping)
    this._setFieldValue(field, mapping, rawValue)

    return field
  }

  createRepeatableFields(
    parentMapping: MappingColumn,
    data: DemandeAggregee,
  ): Field[] | null {
    const rawValueArray = data[parentMapping.originalLabel] as CsvRow[]

    if (!this._isValidArray(rawValueArray) || rawValueArray.length === 0) {
      return null
    }

    const parentField = this._createParentField(parentMapping)
    const childFields = this._createChildFields(
      parentField,
      parentMapping,
      rawValueArray,
    )

    return [parentField, ...childFields]
  }

  private _initializeField(mapping: MappingColumn): Field {
    const field = new Field()

    field.label = mapping.columnLabel || mapping.originalLabel
    field.sourceId = mapping.id
    field.type = mapping.type
    field.dsChampType = DsChampType.TextChamp
    field.fieldSource = mapping.source
    field.formatFunctionRef = mapping.formatFunctionRef || null

    return field
  }

  private _createParentField(mapping: MappingColumn): Field {
    const field = this._initializeField(mapping)

    field.stringValue = mapping.columnLabel || mapping.originalLabel
    field.dsChampType = DsChampType.RepetitionChamp

    return field
  }

  private _createChildFields(
    parentField: Field,
    parentMapping: MappingColumn,
    rawValueArray: CsvRow[],
  ): Field[] {
    const childFields: Field[] = []

    rawValueArray.forEach((item, rowIndex) => {
      parentMapping.children?.forEach((childMapping) => {
        const childField = this._createChildField(
          childMapping,
          item,
          parentField,
          rowIndex,
        )

        if (childField) {
          childFields.push(childField)
        }
      })
    })

    return childFields
  }

  private _createChildField(
    mapping: MappingColumn,
    data: CsvRow,
    parentField: Field,
    rowIndex: number,
  ): Field | null {
    let childValue: unknown

    if (typeof data === 'string') {
      childValue = data
    } else if (typeof data === 'object' && data !== null) {
      childValue = data[mapping.originalLabel]
    }

    if (this._isNullOrUndefined(childValue)) {
      return null
    }

    const field = this._initializeField(mapping)

    field.parent = parentField
    field.dsChampType = DsChampType.PieceJustificativeChamp
    field.parentRowIndex = rowIndex

    if (this._isFileField(mapping)) {
      this._setPieceJustificativeValue(field, data)
    } else {
      this._setFieldValue(field, mapping, childValue)
    }

    return field
  }

  private _setFieldValue(
    field: Field,
    mapping: MappingColumn,
    rawValue: unknown,
  ): void {
    if (this._isPrefectureField(mapping)) {
      this._setPrefectureValue(field, rawValue)
      return
    }

    switch (mapping.type) {
    case FieldType.number:
      this._setNumberValue(field, rawValue)
      break

    case FieldType.date:
      this._setDateValue(field, rawValue)
      break

    case FieldType.boolean:
      this._setBooleanValue(field, rawValue)
      break

    case FieldType.string:
    default:
      this._setStringValue(field, rawValue)
      break
    }
  }

  private _setPieceJustificativeValue(field: Field, data: CsvRow): void {
    field.type = FieldType.file
    field.dsChampType = DsChampType.PieceJustificativeChamp

    const fileData = createFileRawValue({
      nom: data[maarchPJLabel.intitulePj],
    })

    const pieceJustificativeChamp = {
      __typename: 'PieceJustificativeChamp',
      id: field.sourceId || `pj_${Date.now()}`,
      label: data.intitule_pj || data.nom_pj || 'Pièce jointe',
      stringValue: data.intitule_pj || data.nom_pj,
      files: [fileData],
    }

    field.rawJson = pieceJustificativeChamp
    field.stringValue = data.intitule_pj || data.nom_pj || 'Pièce jointe'
  }

  private _setPrefectureValue(field: Field, rawValue: unknown): void {
    const prefectureKey = rawValue as PrefectureKey
    if (prefectureKey && PrefectureDictionary[prefectureKey]) {
      field.stringValue = PrefectureDictionary[prefectureKey]
    } else {
      field.stringValue = String(rawValue)
    }
  }

  private _isFileField(mapping: MappingColumn): boolean {
    return (
      mapping.type === FieldType.file ||
      mapping.originalLabel?.toLowerCase().includes('intitule_pj') ||
      mapping.columnLabel?.toLowerCase().includes('intitulé')
    )
  }

  private _setNumberValue(field: Field, rawValue: unknown): void {
    if (this._isString(rawValue) || this._isNumber(rawValue)) {
      const numValue = parseFloat(String(rawValue))

      if (!isNaN(numValue)) {
        field.numberValue = numValue
        field.stringValue = String(rawValue)
      } else {
        field.stringValue = String(rawValue)
      }
    }
  }

  private _setDateValue(field: Field, rawValue: unknown): void {
    if (this._isDate(rawValue)) {
      field.dateValue = rawValue

      const day = String(rawValue.getDate()).padStart(2, '0')
      const month = String(rawValue.getMonth() + 1).padStart(2, '0')
      const year = rawValue.getFullYear()
      field.stringValue = `${day}/${month}/${year}`
    } else {
      field.stringValue = String(rawValue)
    }
  }

  private _setBooleanValue(field: Field, rawValue: unknown): void {
    if (this._isBoolean(rawValue)) {
      field.stringValue = String(rawValue)
    } else if (this._isString(rawValue)) {
      const lower = rawValue.toLowerCase()
      if (lower === 'true' || lower === 'false') {
        field.stringValue = lower
      }
    }
  }

  private _setStringValue(field: Field, rawValue: unknown): void {
    if (!this._isNullOrUndefined(rawValue)) {
      field.stringValue = String(rawValue)
    }
  }

  private _isPrefectureField(mapping: MappingColumn): boolean {
    const prefectureLabels = [
      maarchChampsLabel.prefecture,
    ]
    return prefectureLabels.some(
      (label) => mapping.originalLabel?.toLowerCase().includes(label),
    )
  }

  private _isString(value: unknown): value is string {
    return typeof value === 'string'
  }

  private _isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value)
  }

  private _isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
  }

  private _isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }

  private _isNullOrUndefined(value: unknown): boolean {
    return value === null || value === undefined
  }

  private _isValidArray(value: unknown): boolean {
    return Array.isArray(value) && value.length > 0
  }
}
