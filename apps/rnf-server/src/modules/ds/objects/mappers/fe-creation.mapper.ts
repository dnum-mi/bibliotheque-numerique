import { FoundationType } from '@prisma/client'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'

export const feCreationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FE as string,
}
