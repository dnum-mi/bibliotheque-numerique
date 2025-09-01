import { IBnConfigurationOutput } from '@biblio-num/shared'
import { CreateBnConfigurationDto } from '@/shared/modules/bn-configurations/objects/dto/create-bn-configuration.dto'

export class BnConfigurationOutputDto
  extends CreateBnConfigurationDto
  implements IBnConfigurationOutput {
  id: number
}
