import { Mapper } from "@/modules/ds/objects/types/mapper.type";
import { ChampHash } from "@/modules/ds/objects/types/champ-hash.type";
import { AddressChamp } from "@dnum-mi/ds-api-client/dist/@types/types";
import { FoundationType } from "@prisma/client";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export const DotationFoundationMapper: Mapper<CreateFoundationDto> = {
  title: (ch: ChampHash) => ch["Titre du fonds de dotation (suivi du sigle s'il existe)"].stringValue ?? null,
  type: () => FoundationType.FDD as string,
  address: (ch: ChampHash) => {
    const addressChamp = ch["Adresse du siège social du fonds de dotation"] as AddressChamp;
    const address = addressChamp.address;
    if (addressChamp.__typename !== "AddressChamp" || !address) {
      return null;
    }
    return {
      label: address.label,
      type: address.type,
      streetAddress: address.streetAddress ?? null,
      streetNumber: address.streetNumber ?? null,
      streetName: address.streetName ?? null,
      postalCode: address.postalCode,
      cityName: address.cityName,
      cityCode: address.cityCode,
      departmentName: address.departmentName ?? null,
      departmentCode: address.departmentCode ?? null,
      regionName: address.regionName ?? null,
      regionCode: address.regionCode ?? null,
    };
  },
  email: (ch: ChampHash) => ch["Courriel du fonds de dotation"].stringValue ?? null,
  phone: (ch: ChampHash) => ch["Numéro de téléphone du fonds de dotation"].stringValue ?? null,
  peopleInFoundationToCreate: (ch: ChampHash) => null,
};
