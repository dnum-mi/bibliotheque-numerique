import {
  ILastConsultedOrganisme,
  FoundationTypeKey,
  organismeStateArrayKey,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsDefined, IsString } from 'class-validator'

export class RecentlyConsultedOrganismeOutputDto implements ILastConsultedOrganisme {
  @ApiProperty({
    description: 'id de l\'organisme',
  })
  @IsString()
  @IsDefined()
  id: string

  @ApiProperty({
    description: 'titre de l\'organisme',
  })
  @IsString()
  @IsDefined()
  title: string

  @ApiProperty({
    description: 'ville de l\'organisme',
  })
  @IsString()
  @IsDefined()
  city: string

  @ApiProperty({
    description: 'code postal de l\'organisme',
  })
  @IsString()
  @IsDefined()
  postalCode: string

  @ApiProperty({
    description: 'type de l\'organisme',
  })
  @IsString()
  @IsDefined()
  type: FoundationTypeKey | 'ASSO'

  @ApiProperty({
    description: 'état de l\'organisme',
  })
  @IsString()
  @IsDefined()
  state: organismeStateArrayKey

  @ApiProperty({
    description: 'Date de la dernière consultation de l\'organisme',
  })
  @IsDate()
  @IsDefined()
  consultedAt: Date
}
