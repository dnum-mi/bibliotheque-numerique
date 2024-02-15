import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'

export class LogInputDto {
  @IsString()
  @IsDefined()
  @IsEnum(['info', 'error', 'warn'])
  level: 'info' | 'error' | 'warn'

  @IsString()
  @IsDefined()
  message: string

  @IsOptional()
  meta?: object
}
