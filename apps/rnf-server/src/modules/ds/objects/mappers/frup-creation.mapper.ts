import { FoundationType } from '@prisma/client'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'

export const frupCreationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FRUP as string,
}
