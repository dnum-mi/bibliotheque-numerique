import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { FoundationType } from '@prisma/client'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'

export const DotationFoundationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FDD as string,
}
