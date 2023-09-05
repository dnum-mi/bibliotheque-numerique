import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'
import { DynamicKeys } from '../dossier'

export class SortDto<T = DynamicKeys> {
  @IsDefined()
  @IsString()
  key: keyof T & string

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC'
}
