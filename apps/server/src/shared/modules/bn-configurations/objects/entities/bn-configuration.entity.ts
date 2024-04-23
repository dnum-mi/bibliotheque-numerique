import { Column, Entity } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  eBnConfiguration,
  BnConfigurationKey,
  BnConfigurationTypeKey,
  eBnConfigurationType,
} from '@biblio-num/shared'
import { IsEnum, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

@Entity({ name: 'bn-configurations' })
export class BnConfiguration extends BaseEntity {
  @ApiProperty({
    description: 'Clef de configuration',
  })
  @Column({
    type: 'enum',
    nullable: false,
    unique: true,
    enum: eBnConfiguration,
  })
  @IsEnum(eBnConfiguration)
  @IsString()
  keyName: BnConfigurationKey

  @ApiProperty({
    description: 'Valeur en string de la configuration',
  })
  @IsString()
  @Column('varchar', {
    nullable: false,
    default: '',
  })
  stringValue: string

  @IsEnum(eBnConfigurationType)
  @IsString()
  @ApiProperty({
    description: 'Type de la valeur de la configuration',
    enum: eBnConfigurationType,
  })
  @Column({
    type: 'enum',
    enum: eBnConfigurationType,
    nullable: false,
    default: eBnConfigurationType.string,
  })
  valueType: BnConfigurationTypeKey
}
