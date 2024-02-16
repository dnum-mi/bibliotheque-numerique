import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'
import { ILogInput } from './log-input.interface'

export class LogInputDto implements ILogInput {
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
