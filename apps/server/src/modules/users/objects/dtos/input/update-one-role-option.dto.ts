import { Prefecture } from '@biblio-num/shared-utils'
import type { IOnePrefectureUpdate, IUpdateOneRoleOption, PrefectureKeys } from '@biblio-num/shared-utils'
import { IsBoolean, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator'

export class OnePrefectureUpdateDto implements IOnePrefectureUpdate {
  @IsBoolean()
  toAdd: boolean

  @IsEnum(Prefecture)
  key: PrefectureKeys
}

export class UpdateOneRoleOptionDto implements IUpdateOneRoleOption {
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
