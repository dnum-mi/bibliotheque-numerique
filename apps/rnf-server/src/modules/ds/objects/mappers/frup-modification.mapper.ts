import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { frupCreationMapper } from './frup-creation.mapper'

export const frupModificationMapper: Mapper = {
  ...frupCreationMapper,
}
