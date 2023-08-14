import { IsArray, IsEnum, IsString, IsOptional } from 'class-validator'
import { Demarche } from '../entities/demarche.entity'

export class GetDemarcheByIdDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @IsEnum(Object.keys(new Demarche()))
      fields?: (keyof Demarche)[]
}
