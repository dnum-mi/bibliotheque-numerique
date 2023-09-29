import { CreateFoundationDto } from '@/modules/foundation/objects/dto/create-foundation.dto'
import { InfoPersonInFoundationDto } from '@/modules/foundation/objects/dto/info-person-in-foundation.dto'

type ExtendedCreateFoundationDto = CreateFoundationDto & { rnfId: string }

// eslint-disable-next-line no-use-before-define
export type RnfFieldKey = foudationMapper & personMapper

type foudationMapper = Record<keyof ExtendedCreateFoundationDto, RegExp>

type personMapper = Record<keyof InfoPersonInFoundationDto, RegExp>
