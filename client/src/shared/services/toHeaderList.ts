import type { TypeHeaderDataTable } from '../../components/typeDataTable'
import type { IDemarcheMappingColumn } from '../interfaces'
import { ChampType, ChampValueTypesKeys, keytoTypeData, typeForHeader, typeTable, valueBytypeValue } from '../types'

export function getTypeForHeader (typeValue: string | undefined) {
  return (typeValue && typeForHeader[typeValue as keyof typeof typeForHeader]) || typeValue
}

export function toByType (value, type) {
  const toByTypeFct = {
    [ChampValueTypesKeys.NUMBER]: (val) => Number(val),
  }
  const fct = toByTypeFct[type]
  return fct ? fct(value) : value
}

export function getValueBytypeValue (
  value: any, // Type champ de DS
  infoType: Partial<IDemarcheMappingColumn>,
) {
  const key = valueBytypeValue[infoType.typeValue as keyof typeof valueBytypeValue] || 'stringValue'
  return value && (value[key] === undefined ? value : toByType(value[key], infoType.typeValue))
}

export function getKeyToTypeData (typeData: string) {
  return keytoTypeData[typeData as keyof typeof keytoTypeData] || typeData
}

export function toHeaderList (mappingCol: Partial<IDemarcheMappingColumn>[]): TypeHeaderDataTable[] {
  return mappingCol?.map((col: Partial<IDemarcheMappingColumn>) => ({
    text: col.labelBN,
    value: col.id,
    type: getTypeForHeader(col.typeValue),
    filter: getTypeFilter(col),
    renderer: getTypeRenderer(col),
  }))
}

const fctDefaultToRowData = (rowDatas: any[], id:string|number, datas:any) => {
  rowDatas[0][id] = datas
  return rowDatas
}

// TODO: A revoir
const fctMultiRowData = (rowDatas:any[], id:string|number, datas:any) => {
  datas.forEach((data:any, index:number) => {
    if (index > (rowDatas.length - 1)) {
      rowDatas = rowDatas[index][id] = data
    }
  })

  return rowDatas
}

const getFctByTypeTable = {
  [typeTable.DEFAULT]: fctDefaultToRowData,
  [typeTable.MULTILINE]: fctMultiRowData,
}

export function toRowData (dataJson: object, mappingCol: Partial<IDemarcheMappingColumn>[]) {
  const result = mappingCol.reduce((acc, col) => {
    const typeData = col.typeData && getKeyToTypeData(col.typeData)
    const lastIndex = col.labelSource ? col.labelSource.length - 1 : 0
    const datas = typeData ? dataJson[typeData] : dataJson

    const values = col.labelSource?.reduce((acc1, cur, index) => {
      let valuestmp

      if (typeData) {
        valuestmp = acc1?.filter(data => data.label === cur)

        return index < lastIndex ? valuestmp?.map(val => val.champs).flat() || valuestmp : valuestmp
      }

      return acc1[cur] || ' '
    }, datas)

    const valueDatas = values.map(value => getValueBytypeValue(value, col))

    acc = getFctByTypeTable[typeTable.DEFAULT](acc, col.id, valueDatas)

    return acc
  }, [{ }])

  return result
}

function getTypeRenderer (mappingColumn: Partial<IDemarcheMappingColumn>) {
  return mappingColumn?.labelSource?.length && mappingColumn?.labelSource?.length > 1 ? 'multi-value' : undefined
}

function getTypeFilter (mappingColumn: Partial<IDemarcheMappingColumn>) {
  return mappingColumn?.labelSource?.length && mappingColumn?.labelSource?.length > 1
    ? 'multi-value'
    : undefined
}
