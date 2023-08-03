import { Champ } from "@dnum-mi/ds-api-client";
import { AddressChamp } from "@dnum-mi/ds-api-client/dist/@types/types";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export type ChampHash = Record<keyof CreateFoundationDto, Champ | AddressChamp>;
