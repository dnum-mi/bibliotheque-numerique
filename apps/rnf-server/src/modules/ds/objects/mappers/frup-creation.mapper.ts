import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { DateChamp } from '@dnum-mi/ds-api-client'
import { frupMapper } from './frup.mapper'

export const frupCreationMapper: Mapper = {
  ...frupMapper,
  originalCreatedAt: (ch: DateChamp | undefined) => {
    return ch?.date ? new Date(ch.date as string) : null
  },

}
