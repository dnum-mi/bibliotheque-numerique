import { IsDefined, IsString } from "class-validator";
import { Address } from "@prisma/client";
import { BaseEntity } from "@/shared/base-entity/base.entity";

export class AddressEntity extends BaseEntity implements Address {
  @IsString()
  @IsDefined()
  label: string;

  @IsString()
  @IsDefined()
  type: string;

  @IsString()
  streetAddress: string | null;

  @IsString()
  streetNumber: string | null;

  @IsString()
  streetName: string | null;

  @IsString()
  @IsDefined()
  postalCode: string;

  @IsString()
  @IsDefined()
  cityName: string;

  @IsString()
  @IsDefined()
  cityCode: string;

  @IsString()
  departmentName: string | null;

  @IsString()
  departmentCode: string;

  @IsString()
  regionName: string | null;

  @IsString()
  regionCode: string | null;
}
