import { PartialType } from '@nestjs/mapped-types'
import { CreateBnConfigurationDto } from '@/shared/modules/bn-configurations/objects/dto/create-bn-configuration.dto'

export class UpdateBnConfigurationDto extends PartialType(
  CreateBnConfigurationDto,
) {}
