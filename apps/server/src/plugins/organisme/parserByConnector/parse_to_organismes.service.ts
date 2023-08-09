import { Injectable } from '@nestjs/common'
import ParseApiRnaV1, { TDataApiRnaV1, TResultApiRnaV1 } from './api_rna_v1'
import ParseApiRnaV3, { TDataApiRnaV3, TResultApiRnaV3 } from './api_rna_v3'
import { IParseToOrganisme } from './parse_to_organisme.interface'
import { LoggerService } from '../../../shared/modules/logger/logger.service'

type TData = Partial<TDataApiRnaV1 | TDataApiRnaV3>;
type TResult = TResultApiRnaV1 | TResultApiRnaV3;
export type TParseToOrganisme = IParseToOrganisme<TData, TResult>;

@Injectable()
export class ParseToOrganismesService {
  mapParsers: Record<string, () => TParseToOrganisme>

  constructor (private readonly logger: LoggerService) {
    this.mapParsers = {
      API_ENTREPRISE_RNA_V3: (): ParseApiRnaV3 => new ParseApiRnaV3(logger),
      API_ENTREPRISE_STAGING_V3: (): ParseApiRnaV3 => new ParseApiRnaV3(logger),
      API_RNA_V1: (): ParseApiRnaV1 => new ParseApiRnaV1(logger),
    }
  }

  getParser (name: string): () => TParseToOrganisme {
    const parser = this.mapParsers[name]
    if (!parser) {
      throw new Error(`No Parser for ${name}`)
    }
    return parser
  }
}
