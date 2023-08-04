import { Foundation, FoundationType } from "@prisma/client";
import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";
import { PersonInFoundationEntity } from "@/modules/foundation/objects/person-in-foundation.entity";
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

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @IsDefined()
  @IsNumber()
  addressId: number;
  address: AddressEntity;

  persons?: PersonInFoundationEntity[];
}
