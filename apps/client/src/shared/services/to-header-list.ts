import type { HeaderDataTable } from '../types'
import type { IDemarcheMappingColumn } from '../interfaces'
import { ChampType, keytoTypeData, typeForHeader, typeTable, valueBytypeValue } from '../types'
import { mappingLabelInstructionToKey } from '../types/InstructionTime.type'

export function getTypeForHeader (mappingColumn: Partial<IDemarcheMappingColumn>) {
  const { typeValue } = mappingColumn
  return (typeValue && typeForHeader[typeValue as keyof typeof typeForHeader]) || typeValue
}

export function toByType (value: string | number, type?: string) {
  return type === 'number' ? Number(value) : value
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

export function toHeaderList (mappingCol: Partial<IDemarcheMappingColumn>[]): HeaderDataTable[] {
  return mappingCol?.map((col: Partial<IDemarcheMappingColumn>) => ({
    text: col.labelBN,
    value: col.id,
    type: getTypeForHeader(col),
    filter: getTypeFilter(col),
    renderer: getTypeRenderer(col),
  }))
}

const fctDefaultToRowData = (rowData: any[], id:string | number, data: any) => {
  rowData[0][id] = data
  return rowData
}

// TODO: A revoir
const fctMultiRowData = (rowData: any[], id:string | number, data: any) => {
  data.forEach((data: any, index: number) => {
    if (index > (rowData.length - 1)) {
      rowData = rowData[index][id] = data
    }
  })

  return rowData
}

const getFctByTypeTable = {
  [typeTable.DEFAULT]: fctDefaultToRowData,
  [typeTable.MULTILINE]: fctMultiRowData,
}

const getValuesFromChamps = (col, data) => col.labelSource?.reduce((dataFound, labelCur, index, sources) => {
  const values = dataFound?.filter(datum => datum.label === labelCur)
  return index < (sources.length - 1) ? values?.map(val => val.champs).flat() || values : values
}, data)

const dictCellByTypeData = {
  [ChampType.CHAMP]: getValuesFromChamps,
  [ChampType.ANNOTATION]: getValuesFromChamps,
  [ChampType.INSTRUCTION_TIME]: (col, data) => (data && [data[mappingLabelInstructionToKey[col.labelSource[0]]]]) || [],
} as const

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

function getTypeRenderer (mappingColumn: Partial<IDemarcheMappingColumn>): string | undefined {
  return (mappingColumn?.labelSource?.length && mappingColumn?.labelSource?.length > 1) ? 'multi-value' : undefined
}

function getTypeFilter (mappingColumn: Partial<IDemarcheMappingColumn>): string | undefined {
  return (mappingColumn?.labelSource?.length && mappingColumn?.labelSource?.length > 1)
    ? 'multi-value'
    : undefined
}
