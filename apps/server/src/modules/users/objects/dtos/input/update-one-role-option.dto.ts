import { Prefecture } from '@biblio-num/shared'
import type {
  IOnePrefectureUpdate,
  IUpdateOneRoleOption,
  PrefectureKey,
} from '@biblio-num/shared'
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class OnePrefectureUpdateDto implements IOnePrefectureUpdate {
  @ApiProperty({
    description: 'Est ce que la valeur est à ajouter ou à retirer',
  })
  @IsBoolean()
  toAdd: boolean

  @ApiProperty({
    description: 'Clef de la prefecture',
    enum: Prefecture,
  })
  @IsEnum(Prefecture)
  key: PrefectureKey
}

export class UpdateOneRoleOptionDto implements IUpdateOneRoleOption {
  @ApiProperty({
    description: 'Id de la démarche pour le role à mettre à jour',
  })
  @IsNumber()
  demarcheId: number

  @ApiProperty({
    description: 'Ajouter ou retirer cette démarche',
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean

  @ApiProperty({
    description: 'Mettre des droits nationaux',
  })
  @IsOptional()
  @IsBoolean()
  national?: boolean

  @ApiProperty({
    description: 'Mettre des droits locaux.',
    type: OnePrefectureUpdateDto,
  })
  @IsOptional()
  @ValidateNested()
  prefecture?: OnePrefectureUpdateDto
}
