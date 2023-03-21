import type { TypeHeaderDataTable } from '../../components/typeDataTable'
import type { IDemarcheMappingColonne } from '../interfaces'

export function typeForHeader (typeValue: string) {
  return ({
    Text: undefined,
    Number: 'number',
    Boolean: 'boolean',
    Date: 'date',
  })[typeValue] || typeValue
}

export function toTypeData (typeData: string) {
  return ({
    champ: 'champs',
    annotation: 'annotations',
  })[typeData] || typeData
}
export function toHeaderList (mappingCol: IDemarcheMappingColonne[]): TypeHeaderDataTable[] {
  return mappingCol.map((col: IDemarcheMappingColonne) => ({
    text: col.labelBN,
    value: col.id,
    type: typeForHeader(col.typeValue),
  }))
}

export function toRowData (dataJson: object, mappingCol: IDemarcheMappingColonne[]) {
  return mappingCol.reduce((acc, col) => {
    const typeData = toTypeData(col.typeData)
    const datas = dataJson[typeData]

    const value = col.labelSource.reduce((acc1, cur) => {
      const value = acc1?.find(data => data.label === cur)
      // console.log('Test', { value, typeData, cur, acc1 })
      return value
    }, datas)
    acc[col.id] = value?.stringValue
    return acc
  }, {})
}
