export type TIconFunction = (data: any) => string;

export type Action = {
  icon: string | TIconFunction;
  condition?: (row: any) => boolean;
}

export type TypeHeaderDataTable = {
  text?: string,
  action?: Action;
  value?: string,
  sortable?: boolean,
  type?: string,
  width?: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFn?: (value: any) => string,
  filter,
  renderer,
}
