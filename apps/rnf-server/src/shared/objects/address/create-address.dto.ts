import { PickType } from "@nestjs/swagger";
import { AddressEntity } from "@/shared/objects/address/address.entity";

export const addressKeys: (keyof AddressEntity)[] = [
  "label",
  "type",
  "streetAddress",
  "streetName",
  "streetNumber",
  "postalCode",
  "cityName",
  "cityCode",
  "departmentName",
  "departmentCode",
  "regionName",
  "regionCode",
];

export class CreateAddressDto extends PickType(AddressEntity, addressKeys) {}
