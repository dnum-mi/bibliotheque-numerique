import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { fddCreationMapper } from '@/modules/ds/objects/mappers/fdd-creation.mapper'

export const fddAdministrationChangesMapper: Mapper = {
  ...fddCreationMapper,
}
