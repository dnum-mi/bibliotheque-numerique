import { Column, Entity } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  eBnConfiguration,
  BnConfigurationKey,
  BnConfigurationTypeKey,
  eBnConfigurationType,
} from '@biblio-num/shared'

@Entity({ name: 'bn-configurations' })
export class BnConfiguration extends BaseEntity {
   @Column(
     {
       type: 'enum',
       nullable: false,
       unique: true,
       enum: eBnConfiguration,
     },
   )
  keyName: BnConfigurationKey

  @Column(
    'varchar',
    {
      nullable: false,
      default: '',
    },
  )
  stringValue: string

  @Column(
    {
      type: 'enum',
      enum: eBnConfigurationType,
      nullable: false,
      default: eBnConfigurationType.string,
    },
  )
  valueType: BnConfigurationTypeKey
}
