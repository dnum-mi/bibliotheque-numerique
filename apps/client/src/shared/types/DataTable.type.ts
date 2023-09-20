import type { ISetFilterParams, ValueFormatterFunc, ValueFormatterParams } from 'ag-grid-community'
import type { Component } from 'vue'

export type TIconFunction = (data: any) => string;

export type Action = {
  icon: string | TIconFunction;
  condition?: (row: any) => boolean;
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
  parseFn?: (value: any) => string,
  filter?: string | ((value: any) => boolean),
  renderer?: Component | string,
  valueFormatter?: (params: ValueFormatterParams) => string | ValueFormatterFunc,
  filterParams?: ISetFilterParams
}

export enum AgGridFilter {
  DATE='date',
  TEXT='text',
  NUMBER='number',
  MULTI_VALUE='multi-value',
  MULTI_VALUE_NUMBER='multi-value-number',
  FILE='file',
}
