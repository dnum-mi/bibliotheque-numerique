import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { Champ } from '@dnum-mi/ds-api-client'

export type Mapper = Record<
  keyof CreateFoundationDto,
  (champs: Champ) => Record<string, string | null> | string | null
>
