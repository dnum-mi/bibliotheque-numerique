import { PeopleEntity } from "@/modules/people/objects/people.entity";
import { PickType } from "@nestjs/swagger";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateAddressDto } from "@/shared/objects/address/create-address.dto";

export const createPeopleDtoKeys: (keyof PeopleEntity)[] = ["firstName", "lastName", "email", "phone"];

export class CreatePeopleDto extends PickType(PeopleEntity, createPeopleDtoKeys) {
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
