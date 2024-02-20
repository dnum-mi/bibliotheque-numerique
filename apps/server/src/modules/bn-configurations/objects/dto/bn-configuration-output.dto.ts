import { IBnConfigurationOutput } from '@biblio-num/shared'
import { CreateBnConfigurationDto } from './create-bn-configuration.dto'

export class BnConfigurationOutputDto extends CreateBnConfigurationDto implements IBnConfigurationOutput {
  id: number
}
