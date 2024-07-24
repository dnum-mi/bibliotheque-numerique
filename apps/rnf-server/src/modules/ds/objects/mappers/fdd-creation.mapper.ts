import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { FoundationType } from '@prisma/client'
import { universalMapper } from '@/modules/ds/objects/mappers/universal.mapper'
import { DateChamp } from '@dnum-mi/ds-api-client'

export const fddCreationMapper: Mapper = {
  ...universalMapper,
  type: () => FoundationType.FDD as string,
  originalCreatedAt: (ch: DateChamp | undefined) => {
    return ch?.date ? new Date(ch.date as string) : null
  },

}
