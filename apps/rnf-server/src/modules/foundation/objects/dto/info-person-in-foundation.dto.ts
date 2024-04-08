import { IsBoolean, IsDate, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateAddressDto } from '@/shared/objects/address/create-address.dto'

export class InfoPersonInFoundationDto {
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
  personBornAt?: Date

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
  @IsBoolean()
  personIsFounder?: boolean

  @ValidateNested()
  @IsString()
  personAdministrator?: string

  @ValidateNested()
  @IsString()
  personRole?: string
}
