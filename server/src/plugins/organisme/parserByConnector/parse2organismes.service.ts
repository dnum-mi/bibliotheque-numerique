import { Injectable } from "@nestjs/common";
import parseApiRnaV1, { TDataApiRnaV1, TResultApiRnaV1 } from "./api_rna_v1";
import ParseApiRnaV3, { TDataApiRnaV3, TResultApiRnaV3 } from "./api_rna_v3";
import { IParse2Organisme } from "./iprase2organisme";

type TData = Partial<TDataApiRnaV1 | TDataApiRnaV3>;
type TResult = TResultApiRnaV1 | TResultApiRnaV3;
export type TParse2Organisme = IParse2Organisme<TData, TResult>;

@Injectable()
export class Parse2OrganismesService {
  mapParsers: Record<string, () => TParse2Organisme>;
  constructor() {
    this.mapParsers = {
      API_ENTREPRISE_RNA_V3: () => new ParseApiRnaV3(),
      API_ENTREPRISE_STAGING_V3: () => new ParseApiRnaV3(),
      API_RNA_V1: () => new parseApiRnaV1(),
    };
  }

  getParser(name: string) {
    const parser = this.mapParsers[name];
    if (!parser) {
      throw new Error(`No Parser for ${name}`);
    }
    return parser;
  }
}
