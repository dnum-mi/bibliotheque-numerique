import { IsDateString, IsOptional } from 'class-validator'
import { isRnfIdValid } from '../../../../../shared/validators/rnf-id/rnf-id.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class GetFoundationsInputDto {
  @ApiProperty({ description: 'Liste des id(s) à sélectionner.' })
  @isRnfIdValid({ each: true })
  rnfIds: string[]

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: "Lister seulement celles qui ont été modifiées depuis 'date'.",
  })
  lastUpdatedAt?: string
}
