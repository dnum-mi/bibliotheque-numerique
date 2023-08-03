import { People as PrismaPeople } from "@prisma/client";
import { IsDate, IsDefined, IsEmail, IsNumber, IsPhoneNumber, IsString } from "class-validator";
import { AddressEntity } from "@/shared/objects/address/address.entity";
import { PeopleInFoundationEntity } from "@/modules/foundation/objects/people-in-foundation.entity";
import { BaseEntity } from "@/shared/base-entity/base.entity";

export class PeopleEntity extends BaseEntity implements PrismaPeople {
  @IsString()
  @IsDefined()
  lastName: string;

  @IsString()
  @IsDefined()
  firstName: string;

  @IsString()
  @IsDefined()
  @IsEmail()
  email: string;

  @IsString()
  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @IsDefined()
  profession: string;

  @IsString()
  @IsDefined()
  nationality: string;

  @IsDate()
  @IsDefined()
  bornAt: Date;

  @IsString()
  @IsDefined()
  bornPlace: string;

  @IsDefined()
  @IsNumber()
  addressId: number;
  address: AddressEntity;

  foundations?: PeopleInFoundationEntity[];
}
