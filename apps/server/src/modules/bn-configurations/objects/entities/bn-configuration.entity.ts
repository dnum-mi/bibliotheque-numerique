import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  BnConfigurationTypes,
  BnConfigurationTypesKeys,
  BnConfigurationKeyNames,
  BnConfigurationMandatoryDataKeys,
} from '@biblio-num/shared'

@Entity({ name: 'bn-configurations' })
export class BnConfiguration extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  declare id: number

  @Column(
    {
      type: 'enum',
      nullable: false,
      unique: true,
      enum: BnConfigurationKeyNames,
      transformer: {
        from: (dbValue: string) => dbValue,
        to: (entityValue: string) => entityValue.toUpperCase(),
      },
    },
  )
  keyName: BnConfigurationMandatoryDataKeys

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
      enum: BnConfigurationTypes,
      nullable: false,
      default: BnConfigurationTypes.STRING,
    },
  )
  valueType: BnConfigurationTypesKeys
}
