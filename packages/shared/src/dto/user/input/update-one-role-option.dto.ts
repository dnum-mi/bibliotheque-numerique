import { Prefecture, PrefectureKeys } from '../../../enums'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

class updateOnePrefecture {
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
  prefecture?: updateOnePrefecture
}
