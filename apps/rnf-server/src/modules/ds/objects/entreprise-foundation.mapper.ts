import { ChampHash } from "@/modules/ds/objects/champ-hash.type";
import { FoundationType } from "@prisma/client";
import { AddressChamp } from "@dnum-mi/ds-api-client/dist/@types/types";
import { Mapper } from "@/modules/ds/objects/mapper.type";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export const EntrepriseFoundationMapper: Mapper<CreateFoundationDto> = {
  title: (ch: ChampHash) => ch["Titre de la fondation d'entreprise"].stringValue ?? null,
  type: () => FoundationType.FE as string,
  address: (ch: ChampHash) => {
    const addressChamp = ch["Adresse du siège social de la fondation d'entreprise"] as AddressChamp;
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
  // TODO: those fields are not in the form. Ask the client
  email: (ch: ChampHash) => null,
  phone: (ch: ChampHash) => null,
  peopleInFoundationToCreate: () => null,
};
