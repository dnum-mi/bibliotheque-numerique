import { ChampHash } from "@/modules/ds/objects/types/champ-hash.type";

export type Mapper<T> = Record<keyof T, (object: ChampHash) => Record<string, string | null> | string | null>;
