export interface IParse2Organisme<T, U> {
  dataJson: T;
  setDataJson(result: Partial<{ data: Partial<U> }>): void;
  getDataUpdateAt(): Date;
}
