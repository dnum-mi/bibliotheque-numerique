import { ICreateBnConfiguration } from '@biblio-num/shared'
import { PickType } from '@nestjs/swagger'
import { BnConfiguration } from '@/shared/modules/bn-configurations/objects/entities/bn-configuration.entity'

export class CreateBnConfigurationDto
  extends PickType(BnConfiguration, ['keyName', 'stringValue', 'valueType'])
  implements ICreateBnConfiguration {}
