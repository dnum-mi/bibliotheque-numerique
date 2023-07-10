import { Organisme } from "../organismes/organisme.entity";

export interface IParseToOrganisme<T, U> {
  dataJson: T;
  setDataJson(result: Partial<{ data: Partial<U> }>): void;
  getDataUpdateAt(): Date;
  toOrganismeEntity(organisme: Organisme, orgDataDataJson: T): Organisme;
}
