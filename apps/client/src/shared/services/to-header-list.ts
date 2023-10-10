import type { HeaderDataTable } from '../types'
import { ChampType, keytoTypeData, typeForHeader, typeTable, valueBytypeValue } from '../types'
import { mappingLabelInstructionToKey } from '../types/InstructionTime.type'

type IDemarcheMappingColumn = {
  id: string
  labelBN: string
  typeValue: string
  labelSource: string[]
  typeData: string
}

export function getTypeForHeader (mappingColumn: Partial<IDemarcheMappingColumn>) {
  const { typeValue } = mappingColumn
  return (typeValue && typeForHeader[typeValue as keyof typeof typeForHeader]) || typeValue
}

export function toByType (value: string | number, type?: string) {
  return type === 'number' ? Number(value) : value
}

export function getValueByTypeValue (
  value: Record<string, string | number>, // Type champ de DS
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

const fctDefaultToRowData = (rowData: Record<string | symbol, unknown>[], id: string | number, data: unknown) => {
  rowData[0][id] = data
  return rowData
}

// TODO: A revoir
const fctMultiRowData = (rowData: Record<string | symbol, unknown>[], id: string | number, arr: unknown[]) => {
  let result
  arr.forEach((data: unknown, index: number) => {
    if (index > (rowData.length - 1)) {
      result = rowData[index][id] = data
    }
  })

  return result
}

const getFctByTypeTable = {
  [typeTable.DEFAULT]: fctDefaultToRowData,
  [typeTable.MULTILINE]: fctMultiRowData,
}

const getValuesFromChamps = (col: IDemarcheMappingColumn, data: {label: string; champs: string}[]) =>
// @ts-ignore à revoir : trop compliqué
  col.labelSource?.reduce((dataFound, labelCur, index, sources) => {
    const values = dataFound?.filter(datum => datum.label === labelCur)
    return index < (sources.length - 1) ? values?.map(val => val.champs).flat() || values : values
  }, data)

const dictCellByTypeData = {
  [ChampType.CHAMP]: getValuesFromChamps,
  [ChampType.ANNOTATION]: getValuesFromChamps,
  [ChampType.INSTRUCTION_TIME]: (col: IDemarcheMappingColumn, data: Record<string, unknown>) =>
    // @ts-ignore dynamic key
    (data && [data[mappingLabelInstructionToKey[col.labelSource[0]]]]) || [],
} as const

export function toRowData (dataJson: Record<string, unknown>, mappingCols: Partial<IDemarcheMappingColumn>[]) {
  const result = mappingCols.reduce((acc, col) => {
    if (!col.labelSource) {
      return getFctByTypeTable[typeTable.DEFAULT](acc, col.id as string | number, [])
    }
    const typeData = col.typeData && getKeyToTypeData(col.typeData)
    const datas = typeData ? dataJson[typeData] : dataJson

    // @ts-ignore dynamic key
    const values = col.typeData && dictCellByTypeData[col.typeData] ? dictCellByTypeData[col.typeData](col, datas) : [datas[col.labelSource[0]]] || ' '
    // @ts-ignore trop compliqué
    const valueDatas = values.map(value => getValueByTypeValue(value, col)) || [values]
    acc = getFctByTypeTable[typeTable.DEFAULT](acc, col.id as string | number, valueDatas)
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
