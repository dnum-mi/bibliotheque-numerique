import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { feCreationMapper } from '@/modules/ds/objects/mappers/fe-creation.mapper'

export const feModificationMapper: Mapper = {
  ...feCreationMapper,
}
