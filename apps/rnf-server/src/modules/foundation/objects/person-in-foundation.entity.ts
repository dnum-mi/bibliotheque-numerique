import { PersonInFoundation, FoundationRole } from '@prisma/client'
import { IsArray, IsDefined, IsEnum } from 'class-validator'
import { PersonEntity } from '@/modules/person/objects/person.entity'
import { BaseEntityOnlyDates } from '@/shared/base-entity/base.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { FoundationHistoryEntity } from '@/modules/foundation/objects/foundation-history.entity'
import { ApiProperty } from '@nestjs/swagger'

export class PersonInFoundationEntity extends BaseEntityOnlyDates implements PersonInFoundation {
  @IsDefined()
  @ApiProperty(
    {
      description: 'L\'ID de la personne',
      type: Number,
    },
  )
  personId: number

  @IsDefined()
  @ApiProperty(
    {
      description: 'L\'ID de la fondation',
      type: Number,
    },
  )
  foundationId: number

  @IsDefined()
  @ApiProperty(
    {
      description: 'L\'ID de l\'historique de la fondation',
      type: Number,
    },
  )
  foundationHistoryId: number

  @IsArray()
  @IsEnum(FoundationRole, { each: true })
  @ApiProperty(
    {
      description: 'Les rôles de la personne dans la fondation',
      type: [String],
    },
  )
  roles: FoundationRole[]

  @ApiProperty(
    {
      description: 'La personne',
      type: PersonEntity,
    },
  )
  person?: PersonEntity

  foundation?: FoundationEntity
  foundationHistory?: FoundationHistoryEntity
}
