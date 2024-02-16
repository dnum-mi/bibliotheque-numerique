import { Prefecture } from '@biblio-num/shared-utils'
import type { PrefectureKeys } from '@biblio-num/shared-utils'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class OnePrefectureUpdateDto {
  @IsBoolean()
  toAdd: boolean

  @IsEnum(Prefecture)
  key: PrefectureKeys
}

export class UpdateOneRoleOptionDto {
  @IsNumber()
  demarcheId: number

  @IsOptional()
  @IsBoolean()
  checked?: boolean

  @IsOptional()
  @IsBoolean()
  national?: boolean

  @IsOptional()
  @ValidateNested()
  prefecture?: OnePrefectureUpdateDto
}
