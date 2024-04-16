import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'
import { DynamicKeys, ISort } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class SortDto<T = DynamicKeys> implements ISort<T> {
  @ApiProperty({
    description: 'Clef du parent paginé. Doit être selectionnée dans les colonnes.',
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
