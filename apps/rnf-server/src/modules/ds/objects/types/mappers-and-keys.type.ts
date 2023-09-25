import { Mapper } from '@/modules/ds/objects/types/mapper.type'
import { RnfFieldKey } from '@/modules/ds/objects/types/rnf-field-keys.type'

export interface MappersAndKeys {
  mappers: Map<string, Mapper>
  rnfFieldKeys: RnfFieldKey
}
