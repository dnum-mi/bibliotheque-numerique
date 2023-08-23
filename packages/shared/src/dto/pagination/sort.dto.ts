import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'

export class SortDto<T> {
  @IsDefined()
  @IsString()
  key: keyof T & string

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC'
}
