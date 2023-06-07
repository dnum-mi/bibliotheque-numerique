import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";
import { ChampHash } from "@/modules/ds/objects/champ-hash.type";

export type Mapper<T> = Record<keyof T, (object: ChampHash) => Record<string, string | null> | string | null>;

export interface DossierToFoundationMapper {
  demarcheName: string;
  mapper: Mapper<CreateFoundationDto>;
}
