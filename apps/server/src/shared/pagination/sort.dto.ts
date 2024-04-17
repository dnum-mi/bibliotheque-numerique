import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'
import { DynamicKeys, ISort } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class SortDto<T = DynamicKeys> implements ISort<T> {
  @ApiProperty({
    description: 'Clef de l\'object paginé. Doit être selectionnée dans les colonnes.',
    type: String,
  })
  @IsDefined()
  @IsString()
  key: keyof T & string

  @ApiProperty({
    description: 'Tri ascendant ou descendant',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC'
}
