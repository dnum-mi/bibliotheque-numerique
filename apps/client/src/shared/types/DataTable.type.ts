import type { ISetFilterParams, ValueFormatterFunc, ValueFormatterParams } from 'ag-grid-community'
import type { Component } from 'vue'

export type TIconFunction = (data: unknown) => string;

export type Action = {
  icon: string | TIconFunction;
  condition?: (row: unknown) => boolean;
}

export type HeaderDataTable = {
  text?: string,
  action?: Action;
  value?: string,
  sortable?: boolean,
  type?: string,
  width?: number,
  hide?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFn?: (value: unknown) => string,
  filter?: string | ((value: unknown) => boolean),
  renderer?: Component | string,
  valueFormatter?: (params: ValueFormatterParams) => string | ValueFormatterFunc,
  filterParams?: ISetFilterParams
}

export const agGridFilterDict = {
  DATE: 'date',
  TEXT: 'text',
  NUMBER: 'number',
  MULTI_VALUE: 'multi-value',
  MULTI_VALUE_NUMBER: 'multi-value-number',
  FILE: 'file',
} as const

export type AgGridFilterKey = typeof agGridFilterDict[keyof typeof agGridFilterDict]
