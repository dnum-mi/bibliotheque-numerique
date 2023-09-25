import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { PickType } from '@nestjs/swagger'
import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreatePersonInFoundationDto } from '@/modules/foundation/objects/dto/create-person-in-foundation.dto'
import { CreateAddressDto } from '@/shared/objects/address/create-address.dto'
import { CreateFileStorageDto } from '@/shared/objects/file-storage/create-file.dto'

export const createFoundationDtoKeys =
  [
    'title',
    'type',
    'email',
    'phone',
  ] satisfies (keyof FoundationEntity)[]

export class CreateFoundationDto extends PickType(FoundationEntity, createFoundationDtoKeys) {
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonInFoundationDto)
  personInFoundationToCreate?: []

  @ValidateNested()
  @Type(() => CreateFileStorageDto)
  status?: CreateFileStorageDto

  @ValidateNested()
  @IsString()
  personQuality?: string

  @ValidateNested()
  @IsString()
  personCivility?: string

  @ValidateNested()
  @IsString()
  personFirstName?: string

  @ValidateNested()
  @IsString()
  personLastName?: string

  @ValidateNested()
  @IsDate()
  personBornAt?: string

  @ValidateNested()
  @IsString()
  personBornPlace?: string

  @ValidateNested()
  @IsString()
  personNationality?: string

  @ValidateNested()
  @IsString()
  personProfession?: string

  @ValidateNested()
  @Type(() => CreateAddressDto)
  personAddress?: CreateAddressDto

  @ValidateNested()
  @IsString()
  personPhone?: string

  @ValidateNested()
  @IsString()
  personAdministrator?: string
}
