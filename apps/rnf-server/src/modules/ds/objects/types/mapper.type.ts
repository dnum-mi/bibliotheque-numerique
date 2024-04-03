import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { Champ, PieceJustificativeChamp, AddressChamp, DateChamp, RepetitionChamp } from '@dnum-mi/ds-api-client'
import { InfoPersonInFoundationDto } from '@/modules/foundation/objects/dto/info-person-in-foundation.dto'

export type Mapper =
  Record<keyof CreateFoundationDto,
    (champs?: Champ | PieceJustificativeChamp | AddressChamp | DateChamp | RepetitionChamp) =>
      Record<string, string | number | null> | string | Date | number[] | boolean | null>
  &
  Record<keyof InfoPersonInFoundationDto,
    (champs?: Champ | PieceJustificativeChamp | AddressChamp | DateChamp | RepetitionChamp) =>
      Record<string, string | number | null> | string | Date | number[] | boolean | null>
