import { Foundation, FoundationType } from "@prisma/client";
import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";
import { PeopleInFoundationEntity } from "@/modules/foundation/objects/people-in-foundation.entity";
import { BaseEntity } from "@/shared/base-entity/base.entity";
import { AddressEntity } from "@/shared/objects/address/address.entity";

export class FoundationEntity extends BaseEntity implements Foundation {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  rnfId: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  title: string;

  @IsEnum(FoundationType)
  @IsDefined()
  type: FoundationType;

  @IsNumber()
  @IsDefined()
  department: number;

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string | null;

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  phone: string | null;

  @IsDefined()
  @IsNumber()
  addressId: number;
  address: AddressEntity;

  peoples?: PeopleInFoundationEntity[];
}
