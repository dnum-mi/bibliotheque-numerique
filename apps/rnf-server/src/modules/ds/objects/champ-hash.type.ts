import { Champ } from "@dnum-mi/ds-api-client";
import { AddressChamp } from "@dnum-mi/ds-api-client/dist/@types/types";

export type ChampHash = Record<string, Champ | AddressChamp>;
