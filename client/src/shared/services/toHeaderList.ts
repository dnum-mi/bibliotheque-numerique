import type { TypeHeaderDataTable } from '../types/typeDataTable'
import type { IDemarcheMappingColumn } from '../interfaces'
import { ChampType, ChampValueTypesKeys, keytoTypeData, typeForHeader, typeTable, valueBytypeValue } from '../types'
import { mappingLabelInstructionToKey } from '../types/instructionTime.type'

export function getTypeForHeader (mappingColumn: Partial<IDemarcheMappingColumn>) {
  const { typeValue, typeData } = mappingColumn
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
    type: getTypeForHeader(col),
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

const getValuesFromChamps = (col, datas) => col.labelSource?.reduce((datasFound, labelCur, index, sources) => {
  const values = datasFound?.filter(data => data.label === labelCur)
  return index < (sources.length - 1) ? values?.map(val => val.champs).flat() || values : values
}, datas)

const dictCellByTypeData = {
  [ChampType.CHAMP]: getValuesFromChamps,
  [ChampType.ANNOTATION]: getValuesFromChamps,
  [ChampType.INSTRUCTION_TIME]: (col, datas) => (datas && [datas[mappingLabelInstructionToKey[col.labelSource[0]]]]) || [],
}

export function toRowData (dataJson: object, mappingCols: Partial<IDemarcheMappingColumn>[]) {
  const result = mappingCols.reduce((acc, col) => {
    if (!col.labelSource) {
      return getFctByTypeTable[typeTable.DEFAULT](acc, col.id, [])
    }
    const typeData = col.typeData && getKeyToTypeData(col.typeData)
    const datas = typeData ? dataJson[typeData] : dataJson

    const values = col.typeData && dictCellByTypeData[col.typeData] ? dictCellByTypeData[col.typeData](col, datas) : [datas[col.labelSource[0]]] || ' '
    const valueDatas = values.map(value => getValueBytypeValue(value, col)) || [values]
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
