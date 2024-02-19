import { IBnConfigurationOutput } from '@biblio-num/shared-utils'
import { CreateBnConfigurationDto } from './create-bn-configuration.dto'

export class BnConfigurationOutputDto extends CreateBnConfigurationDto implements IBnConfigurationOutput {
  id: number
}
