import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { Champ, PieceJustificativeChamp, AddressChamp } from '@dnum-mi/ds-api-client'

export type Mapper = Record<
  keyof CreateFoundationDto,
  (champs?: Champ | PieceJustificativeChamp | AddressChamp) => Record<string, string | number | null> | string | null
>
