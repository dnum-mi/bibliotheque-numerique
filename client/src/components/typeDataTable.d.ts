export type TypeHeaderDataTable = {
  text: string,
  value?: string,
  sortable?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseFn?: (value: any) => string
}
