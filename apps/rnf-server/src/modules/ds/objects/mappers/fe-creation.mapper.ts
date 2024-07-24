import { FoundationType } from '@prisma/client'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'
import { DateChamp } from '@dnum-mi/ds-api-client'

export const feCreationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FE as string,
  originalCreatedAt: (ch: DateChamp | undefined) => {
    return ch?.date ? new Date(ch.date as string) : null
  },

}
