import type { TypeHeaderDataTable } from '../../components/typeDataTable'
import type { IDemarcheMappingColumn } from '../interfaces'
import { ChampType, ChampValueTypesKeys } from '../types'

const typeForHeader = {
  // [ChampValueTypesKeys.TEXT]: undefined,
  // [ChampValueTypesKeys.NUMBER]: 'number',
  // [ChampValueTypesKeys.BOOLEAN]: 'boolean',
  // [ChampValueTypesKeys.DATE]: 'date',
  [ChampValueTypesKeys.PJ]: 'file',
}
export function getTypeForHeader (typeValue: string) {
  return (typeValue && typeForHeader[typeValue as keyof typeof typeForHeader]) || typeValue
}

const valueBytypeValue = {
  // [ChampValueTypesKeys.TEXT]: 'stringValue',
  // [ChampValueTypesKeys.NUMBER]: 'value',
  // [ChampValueTypesKeys.BOOLEAN]: 'value',
  // [ChampValueTypesKeys.DATE]: 'date',
  [ChampValueTypesKeys.PJ]: 'file',
}

export function getValueBytypeValue (
  value: any, // Type champ de DS
  infoType: Partial<IDemarcheMappingColumn>,
) {
  const key = valueBytypeValue[infoType.typeValue as keyof typeof valueBytypeValue] || 'stringValue'
  return value && (value[key] ?? value)
}

const keytoTypeData = {
  [ChampType.CHAMP]: 'champs',
  [ChampType.ANNOTATION]: 'annotations',
}

export function getKeyToTypeData (typeData: string) {
  return keytoTypeData[typeData as keyof typeof keytoTypeData] || typeData
}

export function toHeaderList (mappingCol: IDemarcheMappingColumn[]): TypeHeaderDataTable[] {
  return mappingCol.map((col: IDemarcheMappingColumn) => ({
    text: col.labelBN,
    value: col.id,
    type: getTypeForHeader(col.typeValue),
  }))
}

export function toRowData (dataJson: object, mappingCol: IDemarcheMappingColumn[]) {
  return mappingCol.reduce((acc, col) => {
    const typeData = getKeyToTypeData(col.typeData)
    const lastIndex = col.labelSource.length - 1
    const datas = dataJson[typeData]

    const value = col.labelSource.reduce((acc1, cur, index) => {
      const value = acc1?.find(data => data.label === cur)
      return index < lastIndex ? value.champs || value : value
    }, datas)

    acc[col.id] = getValueBytypeValue(value, col)
    return acc
  }, {})
}
