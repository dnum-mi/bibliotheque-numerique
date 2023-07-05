import { Mapper } from "@/modules/ds/objects/types/mapper.type";
import { ChampHash } from "@/modules/ds/objects/types/champ-hash.type";
import { AddressChamp } from "@dnum-mi/ds-api-client/dist/@types/types";
import { Foundation, FoundationType } from "@prisma/client";
import { CreateFoundationDto } from "@/modules/foundation/objects/dto/create-foundation.dto";

export const DemandeNumeroRnfMapper: Mapper<CreateFoundationDto> = {
  title: (ch: ChampHash) => ch["Titre de la structure"].stringValue ?? null,
  type: (ch: ChampHash) => {
    const typeChamps = ch["Type de structure"];
    switch (typeChamps.stringValue) {
      case "Fondation reconnue d'utilité publique (FRUP)":
        return FoundationType.FRUP;
      case "Fonds de dotation":
        return FoundationType.FDD;
      default:
      case "fondation d'entreprise":
        return FoundationType.FE;
    }
  },
  address: (ch: ChampHash) => {
    const addressChamp = ch["Adresse du siège social de la structure"] as AddressChamp;
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
  email: (ch: ChampHash) => ch["Courriel de contact de la structure"].stringValue ?? null,
  phone: (ch: ChampHash) => ch["Téléphone contact de la structure"].stringValue ?? null,
  peopleInFoundationToCreate: (ch: ChampHash) => null,
};
