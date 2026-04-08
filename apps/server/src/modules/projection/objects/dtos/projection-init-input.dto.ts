import {
  IsBoolean,
  IsOptional,
} from 'class-validator'

export class ProjectionInitInputDto {
  @IsBoolean()
  @IsOptional()
  force: boolean | null
}
