import { FoundationEntity } from "@/modules/foundation/objects/foundation.entity";
import { PickType } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreatePeopleInFoundationDto } from "@/modules/foundation/objects/dto/create-people-in-foundation.dto";
import { CreateAddressDto } from "@/shared/objects/address/create-address.dto";

export const createFoundationDtoKeys = ["title", "type", "email", "phone"] satisfies (keyof FoundationEntity)[];

export class CreateFoundationDto extends PickType(FoundationEntity, createFoundationDtoKeys) {
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePeopleInFoundationDto)
  peopleInFoundationToCreate?: CreatePeopleInFoundationDto[];
}
