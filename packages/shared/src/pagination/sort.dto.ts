import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'
import { DynamicKeys, ISort } from '@biblio-num/shared-utils'

export class SortDto<T = DynamicKeys> implements ISort<T> {
  @IsDefined()
  @IsString()
  key: keyof T & string

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC'
}
