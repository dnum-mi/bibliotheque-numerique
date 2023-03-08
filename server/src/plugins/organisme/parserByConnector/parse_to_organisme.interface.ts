export interface IParseToOrganisme<T, U> {
  dataJson: T;
  setDataJson(result: Partial<{ data: Partial<U> }>): void;
  getDataUpdateAt(): Date;
}
