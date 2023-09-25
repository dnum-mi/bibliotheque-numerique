import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { PickType } from '@nestjs/swagger'
import { IsArray, ValidateNested } from 'class-validator'
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
  personInFoundationToCreate?: CreatePersonInFoundationDto[]

  @ValidateNested()
  @Type(() => CreateFileStorageDto)
  status?: CreateFileStorageDto
}
